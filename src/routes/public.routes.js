import { Router } from 'express';
import { site } from '../controllers/public.controller.js';
import { submit } from '../controllers/enquiry.controller.js';
import { enquiryLimiter } from '../middleware/rateLimit.js';

const r = Router();
r.get('/site', site);
r.post('/enquiries', enquiryLimiter, submit);
export default r;
