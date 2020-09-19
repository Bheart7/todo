const express = require('express');

const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');

// models
const Todo = require('./models/Todo');

const app = express();

const port = process.env.PORT || 3000;

app.use('/static', express.static('public'));

app.use(express.urlencoded({ extended: true }));

// setting view engine for ejs
app.set('view engine', 'ejs');

// connection to db

mongoose.set('useFindAndModify', false);

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Mongodb Connected');

    // listening to port
    app.listen(port, () => {
      console.log('App listening on port 3000');
    });
  }
);

app.get('/', (req, res) => {
  Todo.find({}, (err, todoItems) => {
    res.render('index.ejs', { todos: todoItems });
  });
});

app.post('/', async (req, res) => {
  const todo = new Todo({
    content: req.body.content,
  });

  try {
    await todo.save();
    res.redirect('/');
  } catch (err) {
    res.redirect('/');
  }
});

app
  .route('/edit/:id')
  .get((req, res) => {
    const id = req.params.id;
    Todo.find({}, (err, todoItems) => {
      res.render('edit.ejs', { todos: todoItems, todoId: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;

    Todo.findByIdAndUpdate(id, { content: req.body.content }, err => {
      if (err) return res.send(500, err);

      res.redirect('/');
    });
  });

app.route('/remove/:id').get((req, res) => {
  const id = req.params.id;

  Todo.findByIdAndRemove(id, err => {
    if (err) return res.send(500, err);

    res.redirect('/');
  });
});
