const fs = require('fs');
var createConnection = require('../models/baza');
var ciscenje = require('../models/ciscenje');

const about = (req, res) => {
  res.render('sajt/about', { title: 'O sajtu' });
}

const kontakt = (req, res) => {
  res.render('sajt/kontakt', { title: 'Kontakt' });
}

const faq = (req, res) => {
  res.render('sajt/faq', { title: 'FAQ' });
}

const privacy = (req, res) => {
  res.render('sajt/privacy', { title: 'Privatnost' });
}

const terms = (req, res) => {
  res.render('sajt/terms', { title: 'Pravila' });
}

const reg = (req, res) => {
  res.render('sajt/reg', { title: 'Registracija' });
}

const login = (req, res) => {
  res.render('sajt/login', { title: 'Prijava' });
}


// snima fajl u uploads folder sa user strane
const fileupload = (req, res) => {

  //https://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined
  //https://stackoverflow.com/questions/23691194/node-express-file-upload

  //enctype="multipart/form-data"
  // console.log('u uploadu');
  // console.log(req);
  // console.log(req.body.komentar);
  // console.log('niz files:', req.files);
  // console.log('moj fajl:', req.files.fajl);
  // console.log('ime fajla:', req.files.fajl.name);
  // console.log('data iz fajla:', req.files.fajl.data);

  // ubaciti kod za proveru greške jer ako pošalju form bez fajla pada aplikacija

  // proveriti za encodind pogotovo za css jer u transportu encoding može da nestane i prikazuju se kuke i kvake
  // obratiti pažnju i na ' i '' itd.

  //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file

  // - user__mail_url_timestamp__naziv-fajla-od-korisnika


  // Directory Traversal (File and disclosure). In this attack, a malicious user attempts to access parts of the web server file system that they should not be able to access. This vulnerability occurs when the user is able to pass filenames that include file system navigation characters (for example, ../../). The solution is to sanitize input before using it.

  // čišćenje imena korisnikovog fajla od mogućih zlonamernih kombinacija .. / \
  
  let fname = req.files.fajl.name;
  // fname = './..\\controllers/'+ fname;
  // pattern = /\.\./gm; 
  // fname = fname.replace(pattern, "-");

  fname = fname.replace(/\.\./gm, "-"); // menja .. sa -
  fname = fname.replace(/\//gm, "-");   // menja / sa -
  fname = fname.replace(/\\/gm, "-");   // menja \ sa -
  fname = fname.replace(/\.-/gm, "--"); // menja moguće preostale .- sa --
  fname = fname.replace(/-\./gm, "--"); // menja moguće preostale -. sa --
  fname = fname.replace(/exe/gm, "-e-x-e-"); // menja exe a po potrebi dodati i ostale problematične ekstenzije

  // priprema raznih podataka za dodavanje uz ime korisnikovog fajla

  let user_id = "1";

  //let host_path = req.rawHeaders[33];
  let hostname = req.hostname;
  
  let path = req.path;
  path = path.replace(/\//g, "");
  
  let datum = new Date;
  datum = datum.toString();
  datum = datum.replace(/\(Srednjeevropsko standardno vreme\)/g, "");
  datum = datum.trim();
  datum = datum.replace(/[ :]/g, "-");

  let novo_ime =
    __dirname +
    '../../uploads/' +
    user_id + '_' +
    hostname + '_' +
    path + '_' +
    datum + '_' +
    fname
  ;

  fs.writeFile(
    novo_ime,
    req.files.fajl.data,
    function (err) {

      if (err) throw err;
      console.log('Sačuvan fajl: \n', fname, '\n u: \n', novo_ime);

    }
  );


  // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  //   if (err)
  //     return res.status(500).send(err);

  //   res.send('File uploaded!');
  // });


  // you see that the line sampleFile.mv... is written uploadPath = __dirname + '/uploads/' + sampleFile.name;

  // if (!req.files || Object.keys(req.files).length === 0) {
  //   return res.status(400).send('No files were uploaded.');
  // }

  // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // let sampleFile = req.files.sampleFile;

  // // Use the mv() method to place the file somewhere on your server
  // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  //   if (err)
  //     return res.status(500).send(err);

  //   res.send('File uploaded!');
  // });

  //res.render('sajt/user', { title: 'Korisnici'});
  res.redirect('user');
}


// prikazuje user stranu sa korisničkim porukama
const user = (req, res) => {

  // let upis = req.body;
  //console.log('user prikaz');

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // qery za spisak svih poruka do 100 poslednjih
    connection.query(
      'SELECT b_id, ime_tag, mejl, tema, poruka, datum_upisa FROM g_user_blog ORDER BY b_id DESC LIMIT 20;',
      function (err, results, fields) {
        if (err) throw err;
        // console.log(result);

        let datumx = 'GMT+0100 (Srednjeevropsko standardno vreme)';

        results.forEach(element => {
          for (let property in element) {
            if (element[property] !== null) {

              if (property == "datum_upisa") { // skida se datuma dugačak deo za prikaz na user strani
                tekst = element[property].toString();
                tekst = tekst.replace(datumx, "");
              } else {
                tekst = element[property].toString();
              } 
              
              // sanitacija = (tekst, json, char, tag, event)
              tekst = ciscenje.sanitacija(tekst, 1, 1, 1, 1);

              element[property] = tekst;
            }
          }
        });

        //console.log(results)

        res.render('sajt/user', {
          poruke: results,
          title: 'Korisnici'
        });
      }
    );

    connection.release();
  });

  
}

// ubacuje u bazu korisničke poruke sa user strane
const user_post = (req, res) => {

  let poruka = req.body;
  //console.log('user upis');

  
  let sql_prepared_data = [];

  let sql_prepared_statement = '';

  // za email PROMENITI kako valja KADA SE URADI AUTENTIKACIJA
  let user_id = '9';
  let user_mail = "neki.korisnik@vezbamo.edu";
  let host_path = req.hostname + req.path
  
  let from_req = {
    user_id: user_id,
    user_mail: user_mail,
    host_path: host_path

  }

  createConnection(function(err, con) {

    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // VALIDACIJA unosa u bazu:
    // trim: trimuje space - 0/1
    // upper_case: stavlja velika početna slova - 0/1
    // len: skraćuje tekst na zadatu dužinu - 0-n
    // semicolon: escapuje ; sa \; - 0/1
    //
    // validacija = (tekst, trim, upper_case, len, semicolon)

    // za ova tri ne treba uppercase
    from_req.user_id = ciscenje.validacija(from_req.user_id, 1, 0, 11, 1);
    from_req.user_mail = ciscenje.validacija(from_req.user_mail, 1, 0, 45, 1);
    from_req.host_path = ciscenje.validacija(from_req.host_path, 1, 0, 45, 1);

    poruka.ime_tag = ciscenje.validacija(poruka.ime_tag, 1, 0, 45, 1);
    poruka.mejl = ciscenje.validacija(poruka.mejl, 1, 0, 45, 1);
    poruka.tema = ciscenje.validacija(poruka.tema, 1, 1, 100, 1);
    poruka.poruka = ciscenje.validacija(poruka.poruka, 1, 1, 1000, 1);

    // sql upit
    sql_prepared_statement = 'INSERT INTO g_user_blog (ime_tag, mejl, tema, poruka, user_id, user_mail, from_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    

    // sql pripremljeni podatci nakon validacije
    sql_prepared_data = [
      poruka.ime_tag,
      poruka.mejl,
      poruka.tema,
      poruka.poruka,
      from_req.user_id,
      from_req.user_mail,
      from_req.host_path
    ];
    
    con.execute(
      sql_prepared_statement,
      sql_prepared_data,
      function(err, results, fields) {
        if (err) throw err;
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        // If you execute same statement again, it will be picked from a LRU cache
        // which will save query preparation time and give better performance
      }
    );

    sql_prepared_statement = '';

    sql_prepared_data = [];

    con.release();

    res.redirect('/sajt/user');

  });


  
  //res.render('/sajt/user', { title: 'Korisnici' });
}



module.exports = {
  about,
  kontakt,
  faq,
  privacy,
  terms,
  reg,
  login,
  fileupload,
  user,
  user_post
}