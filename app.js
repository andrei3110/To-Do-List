const express = require('express')
const mysql = require('mysql');
const path = require('path')
const session = require('express-session');
const { query } = require('express');
const app = express();



// Соединение с базой данных
require('dotenv').config();

const connection = mysql.createConnection(
{
 host: process.env.DB_HOST,
 database: process.env.DB_NAME,
 user: process.env.DB_USER,
 password: process.env.DB_PASS,
});

connection.connect(function (err) { if (err) throw err; });

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'))


// Настройка шаблонизатора
app.set('view engine', 'ejs')

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'))

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }))

// Инициализация сессии
app.use(session({ secret: "parol", resave: false, saveUninitialized: true }));

// Middleware
function isAuth(req, res, next) {
  if (req.session.auth) {
    next();
  } else {
    res.redirect('/');
  }
}
// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3012)

/**
 * Маршруты
 */



app.get('/', (req, res) => {
  connection.query("SELECT * FROM notes", (err, data, fields) => {
    if (err) throw err;

    res.render('home', {
      'notes': data,
    });
  });
})


app.get('/auth', (req, res) => {
  
    res.render('auth');
  });

  app.post('/login', (req, res) => {
    connection.query(
      "SELECT * FROM users WHERE name=?  AND password=?",
      [[req.body.name], [req.body.password]], (err, data, fields) => {
        if (err) throw err;
        if (data.length > 0) {
          req.session.auth = true;
          res.redirect('/')
  
        }
        else {
          req.session.auth = false;
          res.redirect('/auth');
  
  
        }
      });
  });
  

  app.post('/register', (req, res) => {

    connection.query(
      "SELECT * FROM users WHERE name=?",
      [[req.body.name]], (err, data, fields) => {
        if (err) throw err;
        if (data.length == 0) {
          connection.query(
            "INSERT INTO users (name, password) VALUES (?, ?)",
            [[req.body.name], [req.body.password]], (err, data, fields) => {
              if (err) throw err;
              connection.query("SELECT * FROM notes", (err, data, fields) => {
                if (err) throw err;
                
                  
              });
              req.session.auth = true;
              res.redirect('/');
            });
  
        }
        else {
          
          req.session.auth = false;
          res.redirect('/auth');
        }
      
      
      })
  
    
  });

  app.post('/register', (req, res) => {//создание колонки для каждого пользователя 

    connection.query(
      "SELECT * FROM notes ",
       (err, data, fields) => {
        if (err) throw err;
        if (data.length == 0) {
          connection.query(
            "ALTER TABLE notes ADD COLUMN (?) VARCHAR(255) NOT NULL FIRST VALUES(?)",
            [[req.body.name]], (err, data, fields) => {
              if (err) throw err;
              
              req.session.auth = true;
              res.redirect('/');
            });
  
        }
        else {
          
          req.session.auth = false;
          res.redirect('/auth');
        }
      
      
      })
  
    
  });

  
  app.post('/add', (req, res) => {
    connection.query(
      "INSERT INTO notes (title) VALUES (?)",
      [[req.body.title]], (err, data, fields) => {
        if (err) throw err;
  
        res.redirect('/')
      });
  })
  
  app.post('/delete', (req, res) => {
    connection.query(
      'DELETE FROM notes WHERE id=?',
      [Number([req.body.id])], (err, data, fields) => {
        if (err) throw err;
  
        res.redirect('/')
      });
  })
  
  