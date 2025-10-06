import { delay } from './promise.js';

// Define the structure for the work function passed to the class
type WorkCallback<T> = (
  threadIndex: number,
  taskIndex: number,
  taskData: T
) => Promise<any>;

// Define the callbacks for lifecycle events
type BeforeCallback<T> = (isProcessing: boolean, totalTasks: T[]) => void | Promise<void>;
type AfterCallback = (isProcessing: boolean, processedCount: number, totalCount: number) => void | Promise<void>;

/**
 * A concurrent task runner that manages a fixed number of workers ("threads")
 * to process an array of tasks asynchronously.
 */
export class TaskPool<T> {
  // --- Configuration ---
  private totalThread: number = 1;
  private sleep: number = 10; // Delay between worker checks (for throttling the loop)

  // --- State ---
  private totalTask: T[] = [];
  private taskIndex: number = 0; // Index of the next task to assign
  private processingIndices: Set<number> = new Set(); // Indices of tasks currently running
  private processedIndices: number[] = []; // Indices of tasks that are complete
  private isProcessing: boolean = false;
  private isPaused: boolean = false;

  // --- External Callbacks ---
  private workCallback!: WorkCallback<T>;
  private beforeCallback: BeforeCallback<T> | undefined;
  private afterCallback: AfterCallback | undefined;


  // --- Public Getters ---

  public getProcessingIndices(): number[] {
    return Array.from(this.processingIndices);
  }

  public getProcessedIndices(): number[] {
    return this.processedIndices;
  }

  public isRunning(): boolean {
    return this.isProcessing;
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  // --- Control Methods ---

  public onPause = (callback?: (isPaused: boolean) => void) => {
    this.isPaused = !this.isPaused;
    if (callback) callback(this.isPaused);
  }

  public onStop = (callback?: (isProcessing: boolean, isPaused: boolean) => void) => {
    this.isProcessing = false;
    this.isPaused = false;
    this.resetState();
    if (callback) callback(this.isProcessing, this.isPaused);
  }

  // --- Core Logic ---

  /**
   * Resets the internal state trackers.
   */
  private resetState(): void {
    this.taskIndex = 0;
    this.processingIndices.clear();
    this.processedIndices = [];
    this.totalTask = [];
  }

  /**
   * Main task execution loop for a single worker thread.
   * Continuously pulls tasks until all tasks are processed or the pool is stopped/paused.
   * @param threadIndex The index of the running thread (0 to totalThread - 1).
   */
  private async worker(threadIndex: number): Promise<void> {
    let taskAssigned = true;

    while (this.isProcessing && taskAssigned) {
      // 1. Check Pause State
      if (this.isPaused) {
        await delay(500); // Wait for half a second if paused
        continue;
      }

      // 2. Safely get the next task index
      let currentTaskIndex = -1;

      // Assign a task atomically
      if (this.taskIndex < this.totalTask.length) {
        currentTaskIndex = this.taskIndex++;
      } else {
        // No more tasks to assign
        taskAssigned = false;
        break;
      }

      const taskData = this.totalTask[currentTaskIndex];

      // 3. Mark as processing and run the work
      this.processingIndices.add(currentTaskIndex);

      try {
        await this.workCallback(threadIndex, currentTaskIndex, taskData);

        // 4. Mark as processed and clean up
        this.processedIndices.push(currentTaskIndex);
        this.processingIndices.delete(currentTaskIndex);

        // 5. Run After Callback
        if (this.afterCallback) {
          await this.afterCallback(
            this.isProcessing,
            this.processedIndices.length,
            this.totalTask.length
          );
        }
      } catch (error) {
        console.error(`Task ${currentTaskIndex} failed on thread ${threadIndex}:`, error);
        // In case of error, still mark as processed (or handle error logic as needed)
        this.processedIndices.push(currentTaskIndex);
        this.processingIndices.delete(currentTaskIndex);
      }

      // 6. Cooperative delay to prevent blocking the event loop entirely
      await delay(this.sleep);
    }
  }

  /**
   * Starts the task runner by initializing worker threads.
   * @param thread The number of concurrent threads (workers).
   * @param tasks The array of tasks to process.
   * @param sleep The delay between worker assignments (ms).
   * @param workCallback The function to execute for each task.
   * @param before Optional callback before starting.
   * @param after Optional callback after each task completes.
   * @returns A Promise that resolves when all tasks are complete or the pool is stopped.
   */
  public onStart = async (
    thread: number,
    tasks: T[],
    sleep: number,
    workCallback: WorkCallback<T>,
    before?: BeforeCallback<T>,
    after?: AfterCallback
  ): Promise<boolean> => {
    // Prevent starting if already running
    if (this.isProcessing) return false;

    // Reset state from previous runs
    this.resetState();

    // 1. Configuration & Initialization
    this.totalThread = Math.max(1, thread);
    this.totalTask = tasks;
    this.sleep = Math.max(5, sleep); // Minimum delay of 5ms
    this.workCallback = workCallback;
    this.beforeCallback = before;
    this.afterCallback = after;
    this.isProcessing = true;

    if (this.beforeCallback) {
      await this.beforeCallback(this.isProcessing, this.totalTask);
    }

    // 2. Create and run all worker Promises concurrently
    const workers: Promise<void>[] = [];
    for (let i = 0; i < this.totalThread; i++) {
      workers.push(this.worker(i));
    }

    // 3. Wait for all workers to finish their assigned tasks
    await Promise.all(workers);

    // 4. Final state cleanup
    this.isProcessing = false;
    this.isPaused = false; // Ensure pause state is clear on finish

    // Return true if all tasks finished, false if stopped prematurely (though Promise.all handles this complexly)
    return this.processedIndices.length === this.totalTask.length;
  }
}
export { };