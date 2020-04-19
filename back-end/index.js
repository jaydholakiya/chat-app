const express = require('express');
const admin = require('firebase-admin')
var firebase = require('firebase-admin');
var key = require('./key.json')
firebase.initializeApp(key);
const db = admin.firestore();
const bodyparser = require('body-parser');
const app = express();
const firebas = require('firebase');
firebas.initializeApp(key);
const multer = require('multer');
app.use(express.static('public'));
app.use('/images', express.static(__dirname + '/public/upload'));
app.use(bodyparser.json());
const cors = require('cors');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(cors({
  origin: 'http://localhost:4200'
}));
app.use(bodyparser.urlencoded({
  extended: true
}))
const path = require('path');
app.use(express.static('public'));

//validation for file
function checkfiletype(file, cb) {
  const filetype = /jpeg|jpg|png|gif/;
  const extname = filetype.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetype.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('ERROR:images only');
  }
}


//multer storage method
const storage = multer.diskStorage({
  destination: './public/upload',
  filename: function (req, file, cb) {
    console.log('yessss')
    console.log(file);
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})


//init upload for multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  },
  fileFilter: function (req, file, cb) {
    console.log(file),
      checkfiletype(file, cb);
  }
}).single('uploadfile')



//registration api for new users with image
app.post('/registration', (req, res) => {
  console.log(req.body);
  upload(req, res, (err) => {
    console.log('pp')
    console.log(req.file);
    var emp = ({
      displayName: req.body.displayName,
      Emailid: req.body.Emailid,
      password: req.body.password,
      filename: req.file.filename,
    });
    
    firebas.auth().createUserWithEmailAndPassword(emp.Emailid, emp.password).then(data => {

      return db.collection('users').add(emp).then(() => {
        console.log("oh yeh")
        // return firebas.auth().currentUser.getIdToken().then(function (idToken) {
          console.log(idToken)
          res.json({
            message: "successfully resgisterd"
          })
        // })
        .catch(function (error) {
          console.log(error)
        });
      }).catch(err => {
        console.log("oh no")
        console.log(err);
      })
    })
    .catch(err => {
      if (err.message == "The email address is already in use by another account.") {
        res.json({
          message: "already exist"
        })
      }
    })
  })
})


var arrayforconnected = [];
io.on('connection', function (socket) {


//online users array for all users
  socket.on('id', (data) => {
    console.log(data);
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.id);
    if (getFruit !== -1) {
      arrayforconnected.splice(getFruit, 1);
      console.log(arrayforconnected)
      io.emit('online users', {
        online: arrayforconnected
      })
    }
  })


//disconnecte the socket when user logout
  socket.on('disconnect', function (data) {
    console.log(data);
    socket.disconnect();
    console.log(arrayforconnected)
  });


//onkeydown event of input
  socket.on('typing', (data) => {
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
    if (getFruit !== -1) {
      var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.to);
      io.sockets.connected[getname.socketid].emit("totyping", 'typing');
    }
  })


  //onkeydown event of input when stop typing
  socket.on('stop typing', (data) => {
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
    if (getFruit !== -1) {
      var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.to);
      io.sockets.connected[getname.socketid].emit("stoptyping", 'stop typing');
    }
  })


  //user join room based on ascii value sum of id
  socket.on('new', (data) => {
    var ntotal = 0;
    var mtotal = 0;
    for (let i = 0; i < data.to.length; i++) {
      var str = data.to;
      ntotal += str.charCodeAt(i);
    }
    for (let i = 0; i < data.me.length; i++) {
      var str = data.me;
      mtotal += str.charCodeAt(i);
    }

    if (ntotal < mtotal) {
      console.log("yes")
      const room = data.me + data.to;
      socket.join(room);
      socket.emit('room is', room);
      console.log(`joined ${room}`)
      socket.on(room, data => {
        const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
        if (getFruit !== -1) {
          console.log('user is online so message delivered');
          const newobj = {
            room: data.room,
            message: data.message,
            sendbyuid: data.sendbyuid,
            sendby: data.sendby,
            internationaldate: data.internationaldate,
            date: data.date,
            to: data.to,
            status: 'delivered'
          }
          io.sockets.in(room).emit('welcome message', newobj);
          db.collection('chat').doc(room).collection('message').add(newobj).then(() => {
            console.log("addes")
          })
        } else {
          const newobj = {
            room: data.room,
            message: data.message,
            sendbyuid: data.sendbyuid,
            sendby: data.sendby,
            internationaldate: data.internationaldate,
            date: data.date,
            to: data.to,
            status: 'not delivered'
          }
          io.sockets.in(room).emit('welcome message', newobj);
          console.log('user is offline so message is note delivered');
          db.collection('chat').doc(room).collection('message').add(newobj).then(() => {
            console.log("addes")
          })
        }
      });
    } else if (mtotal < ntotal) {
      const room = data.to + data.me;
      socket.join(room);
      socket.emit('room is', room);
      console.log(`joined ${room}`)

      socket.on(room, data => {

        const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
        if (getFruit !== -1) {
          console.log('user is online so message delivered')
          const newobj = {
            room: data.room,
            message: data.message,
            sendbyuid: data.sendbyuid,
            sendby: data.sendby,
            internationaldate: data.internationaldate,
            date: data.date,
            to: data.to,
            status: 'delivered'
          }
          io.sockets.in(room).emit('welcome message', newobj);
          db.collection('chat').doc(room).collection('message').add(newobj).then(() => {
            console.log("addes")
          })
        } else {
          const newobj = {
            room: data.room,
            message: data.message,
            sendbyuid: data.sendbyuid,
            sendby: data.sendby,
            internationaldate: data.internationaldate,
            date: data.date,
            to: data.to,
            status: 'not delivered'
          }
          io.sockets.in(room).emit('welcome message', newobj);
          console.log('user is offline so message is not delivered')
          db.collection('chat').doc(room).collection('message').add(newobj).then(() => {
            console.log("addes")
          })
        }
      });
    }
  })


//simple connection socket
  socket.on('startconnnection', function (data) {
    var user = data.connencted;
    var useronlineobjectwithsocketid = {
      socketid: socket.id,
      user: user
    }
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === user);
    if (getFruit !== -1) {
      arrayforconnected.splice(getFruit, 1);
      arrayforconnected.push(useronlineobjectwithsocketid);
    } else {
      arrayforconnected.push(useronlineobjectwithsocketid);

    }
    console.log(arrayforconnected)
    io.emit('online users', {
      online: arrayforconnected
    })
    const nsp = io.of('/chat');
    nsp.on('connection', function (socket) {
      console.log("op")
      console.log(arrayforconnected);
      nsp.emit('online users', {
        online: arrayforconnected
      });
    });

  })


  //chat message send by socket on method
  socket.on('chat', function (data) {
    console.log(data);
    console.log(data.to)
    console.log(arrayforconnected)
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
    if (getFruit !== -1) {
      var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.to);
      console.log(getname);
      io.sockets.connected[getname.socketid].emit("hello", data.message);
    } else {
      console.log("user is offline")
    }
  })


  //friend request with socket adn database
  socket.on('request', function (data) {
    console.log(data);
    const button = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.from);
    if (button !== -1) {
      var newname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.from);
      console.log("--------------")
      console.log(newname);
      var newdata = "success"
      io.sockets.connected[newname.socketid].emit("buttondisable", newdata);
    } else {
      console.log("user is offline");
    }
    console.log(arrayforconnected)
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.to);
    if (getFruit !== -1) {
      var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.to);
      console.log("oh hllo")
      console.log(getname);
      const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
      db.collection("users")
        .doc(data.from)
        .update({
          "sendRequest": arrayUnion(data.to)
        });
      db.collection("users")
        .doc(data.to)
        .update({
          "reciveRequest": arrayUnion(data.from)
        });
      console.log(data.from)
      db.collection('users').doc(data.from).get().then(datas => {
        console.log(datas.data());
        const newarray = {
          id: data.from,
          name: datas.data().displayName,
          email: datas.data().Emailid
        }
        console.log(newarray)
        console.log(getname)
        io.sockets.connected[getname.socketid].emit("accept message", newarray);
      }).catch(err => {
        console.log(err)
      });

    } else {
      console.log("user is offline")
      const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
      db.collection("users")
        .doc(data.from)
        .update({
          "sendRequest": arrayUnion(data.to)
        });
      db.collection("users")
        .doc(data.to)
        .update({
          "reciveRequest": arrayUnion(data.from)
        });
    }
  })


  //accept friend request then update the database and send update with socket
  socket.on('acceptrequest', function (data) {
    console.log(data);
    console.log(data);
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
    db.collection("users")
      .doc(data.to)
      .update({
        "reciveRequest": arrayRemove(data.from),
        "friendList": arrayUnion(data.from)
      }).catch(err => {
        console.log(err)
      });
    db.collection("users")
      .doc(data.from)
      .update({
        "sendRequest": arrayRemove(data.to),
        "friendList": arrayUnion(data.to)
      }).catch(err => {
        console.log(err)
      });
    db.collection('users').doc(data.from).get().then(datass => {
      const newdata = {
        uid: datass.id,
        name: datass.data().displayName,
        email: datass.data().Emailid
      }
      console.log(data.from)
      const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.from);
      if (getFruit !== -1) {
        var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.from);

        io.sockets.connected[getname.socketid].emit("newfriend", newdata);
      }
    })
  })


  //if friend request is not accepted or rejected then button disable
  socket.on('buttonshow', function (data) {
    console.log(data);
    const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === data.from);
    if (getFruit !== -1) {
      var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === data.from);
      console.log(getname)
      console.log(data.from);
      io.sockets.connected[getname.socketid].emit("newbutton", data.to);
      console.log("emitted")
    }
  })
});

//friend request reject update db 
app.post('/reject', (req, res) => {
  console.log(req.body)
  const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
  db.collection("users")
    .doc(req.body.to)
    .update({
      "reciveRequest": arrayRemove(req.body.from),
    }).catch(err => {
      console.log(err)
    });
  db.collection("users")
    .doc(req.body.from)
    .update({
      "sendRequest": arrayRemove(req.body.to),
    }).catch(err => {
      console.log(err)
    });
})


//update when user is offline or online with db update
app.post('/messagestatechange',(req,res) => {
  console.log('in it');
  console.log(req.body);
  for(let ab of req.body){
    console.log(ab);
      db.collection('chat').doc(ab.room).collection('message').where("internationaldate", "==", ab.internationaldate).get().then((data) => {
      data.forEach((doc) => {
        console.log('datas')
          console.log(doc.data());
          console.log(doc.id);
          const abcd = doc.id;
          console.log('ab')
          console.log(ab)
          db.collection('chat').doc(ab.room).collection('message').doc(abcd).update({
            status: 'delivered',
        }).then(console.log('update')).catch((err) => {
          console.log(err);
        });
        });
      })
  }
})


//api for users requests
app.post('/getrequests', (req, res) => {
  console.log(req.body.id)
  var response = [];
  db.collection("users").doc(req.body.id).get().then(data => {
    console.log(data.data())
    console.log(data.data().reciveRequest);
    const recivedrequest = data.data().reciveRequest
    const recivedrequestlength = data.data().reciveRequest.length

    for (let i = 0; i < recivedrequest.length; i++) {
      db.collection("users").doc(recivedrequest[i]).get().then(data => {
        var newobj = {
          id: recivedrequest[i],
          name: data.data().displayName,
          email: data.data().Emailid,
        }
        response.push(newobj);
        if (response.length == recivedrequestlength) {
          console.log(response)
          res.send(response)
        }
      });
    }
  }).catch(err => {
    console.log(err)
  });
})


// api for login user
app.post('/login', (req, res) => {
  console.log(req.body.Emailid);
  firebas.auth().signInWithEmailAndPassword(req.body.Emailid, req.body.password).then((result) => {
    console.log(result.user.uid)
    // result.user.getIdToken().then(token => {
      return db.collection("users").where("Emailid", "==", req.body.Emailid)
        .get()
        .then(function (querySnapshot) {
          console.log(querySnapshot.docs)
          var b = querySnapshot.docs.find(d => d = {
            Emailid: req.body.Emailid
          });
          var c = b.data()
          console.log(c.displayName)
          console.log(c)
          querySnapshot.forEach((data => {
            console.log(data.id)
            const newid = data.id;
            totalresponse = {
              uid: newid,
              token: token,
              displayName: c.displayName,
              image: c.filename,
            }
          }))
          res.json(totalresponse)
          console.log(result.user.providerData)
        }).catch(err => {
          console.log(err)
        });
    // })
  }).catch(err => {
    if (err.message == "There is no user record corresponding to this identifier. The user may have been deleted.") {
      res.send({
        message: "there is no user like this"
      });
    }
  });
})


//give all user to the user login inspite of login user
app.post('/allusers', (req, res) => {
  console.log(req.body)
  db.collection('users').doc(req.body.uid).get().then(datas => {
    db.collection('users').get().then(data => {
      let screms = [];
      data.forEach(doc => {
        screms.push({
          id: doc.id,
          displayName: doc.data().displayName,
          Emailid: doc.data().Emailid,
        });
      })
      if (datas.data().friendList === undefined) {
        res.send(screms);
      } else {
        const response = screms.filter(n => !datas.data().friendList.some(n2 => n.id === n2));
        res.send(response);
      }
      console.log("on")
      // console.log(response)

    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
})


//api for request list of user
app.post('/getrequestlist', (req, res) => {
  console.log(req.body.uid);
  db.collection('users').doc(req.body.uid).get().then(data => {
    console.log(data.data());
    res.json(data.data().sendRequest);
  }).catch(err => console.log(err))
})


//user friend list
var arrayoffriend = [];
app.post('/getfriends', (req, res) => {
  console.log(req.body);
  db.collection('users').doc(req.body.id).get().then(data => {
    console.log(data.data().friendList.length);
    var newcount = data.data().friendList.length;
    if (newcount === 0) {
      res.json("sorry you don't have friends");
    } else {
      for (let i = 0; i < newcount; i++) {
        db.collection('users').doc(data.data().friendList[i]).get().then(data => {
          const newdata = {
            uid: data.id,
            name: data.data().displayName,
            email: data.data().Emailid,
            image: data.data().filename
          }
          arrayoffriend.push(newdata);
          if (arrayoffriend.length == newcount) {
            console.log('array of friends')
            console.log(arrayoffriend);
            res.send(arrayoffriend);
          }
        })
      }
    }
    arrayoffriend = [];
  }).catch(err => {
    console.log(err)
  })
});


//remove friend api with chat deletion on db
app.post('/removefriend', (req, res) => {
  console.log(req.body)

  var ntotal = 0;
  var mtotal = 0;
  for (let i = 0; i < req.body.from.length; i++) {
    var str = req.body.from;
    ntotal += str.charCodeAt(i);
  }
  for (let i = 0; i < req.body.local.length; i++) {
    var str = req.body.local;
    mtotal += str.charCodeAt(i);
  }
  if (ntotal < mtotal) {
    const room = req.body.local + req.body.from;
    console.log('room is' + room);
    db.collection('chat').doc(room).collection('message').listDocuments().then((data) => {
      data.map((data) => {
        data.delete();
      })
      console.log("deleted")
    })
  } else {
    const room1 = req.body.from + req.body.local;
    console.log('room1 is' + room1);
    db.collection('chat').doc(room1).collection('message').listDocuments().then((data) => {
      data.map((data) => {
        data.delete();
      })
      console.log("deleted")
    })
  }
  const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
  db.collection("users")
    .doc(req.body.local)
    .update({
      "friendList": arrayRemove(req.body.from),
    }).catch(err => {
      console.log(err)
    });
  db.collection("users")
    .doc(req.body.from)
    .update({
      "friendList": arrayRemove(req.body.local),
    }).catch(err => {
      console.log(err)
    });
  const getFruit = arrayforconnected.findIndex(arrayforconnected => arrayforconnected.user === req.body.from);
  if (getFruit !== -1) {
    var getname = arrayforconnected.find(arrayforconnected => arrayforconnected.user === req.body.from);
    console.log(getname)
    console.log(req.body.from);
    db.collection('users').doc(req.body.from).get().then(datas => {
      console.log("ooooooooooooo")
      console.log(datas.data())
      const newobj = {
        id: req.body.from,
        displayName: datas.data().displayName,
        Emailid: datas.data().Emailid
      }
      io.sockets.connected[getname.socketid].emit("userafterremove", newobj);
      console.log("emitted")
    })
  }
})


//api for message get from db
app.post('/getmessages', (req, res) => {
  const arrayofmessage = [];
  console.log(req.body);
  db.collection('chat').doc(req.body.room).collection('message').orderBy('internationaldate').get().then((data) => {
    data.forEach(doc => {
      console.log(doc.data());
      arrayofmessage.push(doc.data())
    })
    res.send(arrayofmessage);
  })
})
http.listen(8000, () => console.log('server started on : 8000'));