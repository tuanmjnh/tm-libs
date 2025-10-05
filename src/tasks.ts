import { delay } from './promise'
export class Tasks {
  private totalThread: number = 1
  private sleep: number = 100
  private totalTask: Array<any> = []
  private threads: Array<number> = []
  private processing: Array<number> = []
  private processed: Array<number> = []
  public IsProcessing: boolean = false
  private IsPause: boolean = false
  // private doWork: () => void

  constructor() {//totalThread: number, totalTask: number, sleep?: number,isProcessing: boolean, isPause: boolean,
    // this.totalThread = totalThread
    // this.totalTask = totalTask
    // this.sleep = sleep || 100
    // this.IsProcessing = isProcessing
    // this.IsPause = isPause
    // for (let index = 0; index < this.totalThread; index++) this.threads[index] = -1
  }


  public getProcessing(): Array<number> {
    return this.processing
  }

  public getProcessed(): Array<number> {
    return this.processed
  }

  public getThreads(): Array<number> {
    return this.threads
  }

  public isProcessing(): boolean {
    return this.IsProcessing
  }

  public isPause(): boolean {
    return this.IsPause
  }

  public onPushProcessed = (task: number) => {
    this.processed.push(task)
  }

  public onResetThread = (index: number) => {
    this.threads[index] = -1
  }

  public onPause = (callback?: Function) => {
    this.IsPause = !this.IsPause
    if (callback) callback(this.IsPause)
  }

  public onStop = (callback?: Function) => {
    this.IsProcessing = false
    this.IsPause = false
    this.processing = []
    this.processed = []
    // ticks.value = []
    // for (let index = 0; index < this.totalThread; index++) this.threads[index] = -1
    if (callback) callback(this.IsProcessing, this.IsPause)
  }

  public onStart = async (thread: number, tasks: Array<any>, sleep: number, before?: Function, after?: Function) => {
    this.totalThread = thread
    this.totalTask = tasks
    this.sleep = sleep
    for (let index = 0; index < this.totalThread; index++) this.threads[index] = -1
    return new Promise(async (resolve) => {
      this.IsProcessing = true
      if (before) before(this.IsProcessing, this.totalTask)
      //Run while task done < total task
      // console.log(this.processed.length, this.totalTask.length)
      while (this.processed.length < this.totalTask.length) {
        // console.log(this.totalTask)
        try {
          //loop all task to doing
          for (let t = 0; t < this.totalThread; t++) {
            await delay(this.sleep || 10)
            // console.log(this.totalThread)
            for (let i = 0; i < this.totalTask.length; i++) {
              await delay(this.sleep || 10)
              //skip if exist task
              if (!this.IsProcessing) break
              if (this.processing.indexOf(i) > -1) continue
              if (this.threads[t] == -1) {
                this.threads[t] = i
                this.processing.push(i)
                // Task working
                // this.doWork()
                // onTick(threads[t], i, 100).then((interval) => {
                //   threads[t] = -1
                //   tasks.value.done.push(i)
                // })
                if (after) await after(t, i, this.totalTask[i], this.IsProcessing, this.processing, this.processed)
                //   .then(x => {
                //   this.threads[t] = -1
                //   this.processed.push(i)
                // })
              } else continue
            }
          }
        } catch (e) {
          // console.log(e)
          continue
        }
      }
      resolve(true)
      this.IsProcessing = false
      this.processing = []
      this.processed = []
    })
  }

  /**
 * Callback được gọi trước khi bắt đầu xử lý các task
 * @param isProcessing trạng thái xử lý
 * @param totalTask danh sách task
 */
  public before?(isProcessing: boolean, totalTask: Array<any>): void | Promise<void> { }

  /**
 * Callback được gọi sau khi một task được phân cho thread xử lý
 * @param thread chỉ số thread
 * @param index chỉ số task
 * @param task dữ liệu task
 * @param isProcessing trạng thái xử lý
 * @param processing danh sách task đang xử lý
 * @param processed danh sách task đã xử lý
 */
  public after?(
    thread: number,
    index: number,
    task: any,
    isProcessing: boolean,
    processing: Array<number>,
    processed: Array<number>
  ): void | Promise<void> { }
}
export { };