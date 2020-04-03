const express = require('express');
const admin = require('firebase-admin')
var firebase = require('firebase-admin');
var key = require('./key')
firebase.initializeApp(key);
const db = admin.firestore();
const bodyparser = require('body-parser');
const app = express();
const firebas = require('firebase');
// var gcloud = require('gcloud');
// const gcloud = require('google-cloud')
// var gcloud = require('gcloud')({ ... }); var gcs = gcloud.storage();
// var bucket = gcs.bucket('<your-firebase-storage-bucket>');
var config = {
  apiKey: "AIzaSyDjCZoHVr6BMiQMS-uO9U5fN6gcp0mPWqM",
  authDomain: "chatpp-da297.firebaseapp.com",
  databaseURL: "https://chatpp-da297.firebaseio.com",
  projectId: "chatpp-da297",
  storageBucket: "chatpp-da297.appspot.com",
  messagingSenderId: "956935763818",
  appId: "1:956935763818:web:ae9d71ac0e67ebb3ab9713",
  measurementId: "G-KKVNKKNV10"
};

const formidable = require('formidable');
const form = formidable({ multiples: true });
firebas.initializeApp(config);
// var storage = firebase.storage().bucket();
// const {Storage} = require('@google-cloud/storage');
// var storages = firebase.storage();
// var storageRef = storages.bucket("my-bucket")
// const storage = new Storage();


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

var arrayforconnected = [];
io.on('connection', function (socket) {

    socket.on('create', function(room) {
      socket.join(room);
      console.log(room)
      io.sockets.in(room).emit('chat message', "asasas");
      socket.on(room, data => {
        console.log("000000000000000000000")
        console.log(data)
        socket.to(room).emit('new data',`data is ${data.message};
        send from ${data.from}
        send to ${room}`);
        // socket.on('new datas',data => {
        //   console.log(data)
          
        // });
      });
  
    });


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

  })
  socket.on('chat', function (data) {
    console.log(data);
    console.log(data.to)
    console.log("----------------------")
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


app.post('/sendrequest', (req, res) => {
  console.log(req.body);
})


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



app.post('/login', (req, res) => {
  console.log(req.body.Emailid);
  firebas.auth().signInWithEmailAndPassword(req.body.Emailid, req.body.password).then((result) => {
    console.log(result.user.uid)
    result.user.getIdToken().then(token => {
      console.log(token)
      db.collection("users").where("Emailid", "==", req.body.Emailid)
        .get()
        .then(function (querySnapshot) {
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
            }
          }))
          res.json(totalresponse)
          console.log(result.user.providerData)
        }).catch(err => {
          console.log(err)
        });
    })
  }).catch(err => {
    if (err.message == "There is no user record corresponding to this identifier. The user may have been deleted.") {
      res.send({
        message: "there is no user like this"
      });
    }
  });
})


app.post('/registration', (req, res) => {
  console.log(req.body);
   
  // form.parse(req, (err, fields, files) => {
  //   if (err) {
  //     next(err);
  //     return;
  //   }
  //   console.log(fields)
  //   console.log(files)
  //   // ({ fields, files });
  //   var storageRef = firebas.storage().ref();

  //   var uploadTask = storageRef.child('images/octofez.png').put(files);
    
  //   // Register three observers:
  //   // 1. 'state_changed' observer, called any time the state changes
  //   // 2. Error observer, called on failure
  //   // 3. Completion observer, called on successful completion
  //   uploadTask.on('state_changed', function(snapshot){
  //   }, function(error) {
  //       console.error("Something nasty happened", error);
  //   }, function() {
  //     var downloadURL = uploadTask.snapshot.downloadURL;
  //     console.log("Done. Enjoy.", downloadURL);
  //   });
  //   console.log(`${files} uploaded to ${'my-bucket'}.`);
  // });
  // });

  firebas.auth().createUserWithEmailAndPassword(req.body.Emailid, req.body.password).then(data => {

    db.collection('users').add(req.body).then(() => {
      console.log("oh yeh")
      firebas.auth().currentUser.getIdToken().then(function (idToken) {
        console.log(idToken)
        res.json({
          message: "successfully resgisterd"
        })
      }).catch(function (error) {
        console.log(error)
      });
    }).catch(err => {
      console.log("oh no")
      console.log(err);
    })
  }).catch(err => {
    if (err.message == "The email address is already in use by another account.") {
      res.json({
        message: "already exist"
      })
    }
  })
})



app.post('/allusers', (req, res) => {
  console.log(req.body)
  db.collection('users').doc(req.body.uid).get().then(datas => {
    console.log(datas.data().friendList);
    var a = datas.data().friendList.length;
    console.log(a);
    db.collection('users').get().then(data => {
      let screms = [];
          data.forEach(doc => {
              screms.push({
                id: doc.id,
                displayName: doc.data().displayName,
                Emailid: doc.data().Emailid,
              });
          })
          const response = screms.filter(n => !datas.data().friendList.some(n2 => n.id === n2));
          console.log("on")
          console.log(response)
          res.send(response);
    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
})



app.post('/getrequestlist', (req, res) => {
  console.log(req.body.uid);
  db.collection('users').doc(req.body.uid).get().then(data => {
    console.log(data.data());
    res.json(data.data().sendRequest);
  }).catch(err => console.log(err))
})


var arrayoffriend = [];
app.post('/getfriends', (req, res) => {
  console.log(req.body);
  db.collection('users').doc(req.body.id).get().then(data => {
    console.log(data.data().friendList.length);
    var newcount = data.data().friendList.length;
    if(newcount===0) {
      res.json("sorry you don't have friends");
    }else{
    for (let i = 0; i < newcount; i++) {
      db.collection('users').doc(data.data().friendList[i]).get().then(data => {
        const newdata = {
          uid: data.id,
          name: data.data().displayName,
          email: data.data().Emailid
        }
        arrayoffriend.push(newdata);
        if (arrayoffriend.length == newcount) {
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




app.post('/removefriend', (req, res) => {
  console.log(req.body)
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
})






http.listen(8000, () => console.log('serverstarte on : 8000'));
