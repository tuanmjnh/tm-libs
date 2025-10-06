import requestIp from 'request-ip';

// 1. Define a minimal interface for the Request object, including the property added by clientIp middleware.
interface Request extends Record<string, any> {
  ip?: string;
  protocol: string;
  originalUrl: string;
  headers: Record<string, any>;
  get: (header: string) => string | undefined;
  connection?: {
    remoteAddress?: string;
  };
  // The IP property added by our clientIp middleware
  clientIP?: string | null;
}

// Minimal interface for standard middleware functions
type Response = any;
type NextFunction = () => void;

/**
 * Normalizes an IP address string by handling common IPv6 formats.
 * - Removes the "::ffff:" prefix from IPv6-mapped IPv4 addresses.
 * - Maps "::1" (IPv6 loopback) to "127.0.0.1" (IPv4 loopback).
 * * @param ip The raw IP address string.
 * @returns The normalized IP address string, or null if the input was null.
 */
function formatClientIP(ip: string | null): string | null {
  if (!ip) return ip;

  // If IPv6 mapped IPv4 → remove prefix "::ffff:"
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  // If it is "::1" (IPv6 localhost) → redirect to 127.0.0.1
  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}

/**
 * Express/Koa middleware to detect the client's IP using request-ip and normalize it.
 * The normalized IP is assigned to the request object as `req.clientIP`.
 * * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 */
export const clientIpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // request-ip automatically reads x-forwarded-for, x-real-ip, etc.
  const rawIP = requestIp.getClientIp(req);

  // Assign the normalized IP to a custom request property
  req.clientIP = formatClientIP(rawIP);

  next();
};

/**
 * Retrieves the client's IP address by falling back to various request properties (manual logic).
 * Handles common loopback formats (::1, ::ffff:127.0.0.1) by mapping them to 127.0.0.1.
 * * NOTE: Prefer using `request.clientIP` after applying `clientIpMiddleware` for proxy-aware detection.
 *
 * @param request The request object.
 * @returns The client's IP address as a string, defaulting to '127.0.0.1'.
 */
export const getClientIpFromRequest = (request: Request): string => {
  // Priority: 1. IP set by framework middleware, 2. Raw connection address
  let ip = request.ip || request.connection?.remoteAddress;

  // Fallback logic for common local/loopback addresses
  if (!ip) {
    return '127.0.0.1';
  }

  // Reuse the formatting logic for consistency
  const normalizedIp = formatClientIP(ip);

  // Defaulting to 127.0.0.1 if the normalized IP is null (shouldn't happen here, but safe)
  return normalizedIp || '127.0.0.1';
};

/**
 * Constructs the base host URL (protocol + host).
 *
 * @param request The request object.
 * @returns The host URL (e.g., "http://localhost:3000" or "https://api.example.com").
 */
export const getHost = (request: Request): string => {
  if (request) {
    // Use request.get('host') as it includes the port
    const host = request.get('host');
    if (host) {
      return `${request.protocol}://${host}`;
    }
  }
  // Fallback for environments where the request object is missing or invalid
  return 'http://127.0.0.1';
};

/**
 * Constructs the full URL (protocol + host + original path/query).
 *
 * @param request The request object.
 * @returns The full URL (e.g., "http://example.com/api/users?id=1").
 */
export const getHostUrl = (request: Request): string => {
  if (request) {
    // Reuse getHost for the protocol://host part
    const hostBase = getHost(request);
    return `${hostBase}${request.originalUrl}`;
  }
  return 'http://127.0.0.1/';
};

/**
 * Retrieves the User-Agent string from the request headers.
 *
 * @param request The request object.
 * @returns The User-Agent string or 'undefined' if not found.
 */
export const getUserAgent = (request: Request): string => {
  if (request) {
    // Check both direct headers access and the getter method
    const userAgent = request.headers['user-agent'] || request.get('user-agent');
    if (userAgent) {
      return userAgent;
    }
  }
  return 'undefined';
};

export { };