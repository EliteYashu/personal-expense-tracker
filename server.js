const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.redirect('/HTML/personal_expense.html');
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_expense_tracker';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error.message);
  });

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const dataSchema = new mongoose.Schema({
  type: String,
  name: String,
  id: String,
  email: String,
  password: String,
  phone: String,
  branch: String,
  course: String,
  salary: Number,
  base_salary: Number,
  salary_paid: Number,
  salary_payment_date: String,
  year: String,
  gpa: Number,
  date_of_birth: String,
  address: String,
  father_name: String,
  status: String,
  fees_due: Number,
  fees_paid: Number,
  attendance_present: Number,
  attendance_absent: Number,
  attendance_total: Number,
  attendance_month: String,
  attendance_from_date: String,
  attendance_to_date: String,
  results: String
}, { timestamps: true });

const Data = mongoose.model('Data', dataSchema);

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

app.get('/api/db-status', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    connected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null
  });
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();
    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/data/:id', async (req, res) => {
  try {
    const updated = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/data/:id', async (req, res) => {
  try {
    await Data.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const { category, month, date } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (month) {
      const [year, monthIndex] = month.split('-').map(Number);
      if (year && monthIndex) {
        const start = new Date(year, monthIndex - 1, 1);
        const end = new Date(year, monthIndex, 1);
        query.date = { $gte: start, $lt: end };
      }
    }

    if (date) {
      const day = new Date(`${date}T00:00:00.000Z`);
      if (!Number.isNaN(day.getTime())) {
        const nextDay = new Date(day);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        query.date = { $gte: day, $lt: nextDay };
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({ expenses, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/migrate', async (req, res) => {
  try {
    const { data } = req.body;
    await Data.deleteMany({});
    const inserted = await Data.insertMany(data);
    res.json({ success: true, count: inserted.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
