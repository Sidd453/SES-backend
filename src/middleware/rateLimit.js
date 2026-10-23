import rateLimit from 'express-rate-limit';

const make = (windowMs, max, message) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });

export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests, please slow down');
export const loginLimiter = make(15 * 60 * 1000, 10, 'Too many login attempts. Try again in 15 minutes');
export const enquiryLimiter = make(60 * 60 * 1000, 8, 'Too many enquiries from this address. Please try later or call us');
