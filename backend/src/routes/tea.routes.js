import { Router } from 'express';
import TeaEntry from '../models/tea.model.js';

const router = Router();

function dateRange(month, year) {
  if (!month || !year) return null;
  const m = Number(month), y = Number(year);
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y) || y < 2000 || y > 2100) {
    const error = new Error('Invalid month or year'); error.status = 400; throw error;
  }
  return { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const range = dateRange(req.query.month, req.query.year);
    if (range) filter.date = range;
    if (req.query.search?.trim()) filter.personName = { $regex: req.query.search.trim(), $options: 'i' };
    const entries = await TeaEntry.find(filter).sort({ date: -1, personName: 1 }).lean();
    res.json({ success: true, data: entries });
  } catch (e) { next(e); }
});

router.get('/summary', async (req, res, next) => {
  try {
    const range = dateRange(req.query.month, req.query.year);
    const match = range ? { date: range } : {};
    const [totals] = await TeaEntry.aggregate([
      { $match: match },
      { $group: { _id: null, totalTea: { $sum: '$count' }, entryCount: { $sum: 1 }, people: { $addToSet: '$personName' } } },
      { $project: { _id: 0, totalTea: 1, entryCount: 1, peopleCount: { $size: '$people' } } }
    ]);
    const byPerson = await TeaEntry.aggregate([
      { $match: match },
      { $group: { _id: '$personName', totalTea: { $sum: '$count' }, entries: { $sum: 1 } } },
      { $sort: { totalTea: -1, _id: 1 } },
      { $project: { _id: 0, personName: '$_id', totalTea: 1, entries: 1 } }
    ]);
    res.json({ success: true, data: { totalTea: totals?.totalTea || 0, entryCount: totals?.entryCount || 0, peopleCount: totals?.peopleCount || 0, byPerson } });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { personName, date, count, remarks = '' } = req.body;
    if (!personName?.trim() || !date || !Number.isInteger(Number(count)) || Number(count) < 0) {
      return res.status(400).json({ success: false, message: 'Person, valid date and a non-negative whole tea count are required.' });
    }
    const entry = await TeaEntry.create({ personName, date, count: Number(count), remarks });
    res.status(201).json({ success: true, data: entry });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { personName, date, count, remarks = '' } = req.body;
    if (!personName?.trim() || !date || !Number.isInteger(Number(count)) || Number(count) < 0) {
      return res.status(400).json({ success: false, message: 'Person, valid date and a non-negative whole tea count are required.' });
    }
    const entry = await TeaEntry.findByIdAndUpdate(req.params.id,
      { personName, date, count: Number(count), remarks }, { new: true, runValidators: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const entry = await TeaEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (e) { next(e); }
});

export default router;
