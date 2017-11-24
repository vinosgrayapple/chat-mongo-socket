const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Conect to mongo
const url = 'mongodb://localhost:27017/mongochat';
mongo.connect(url, function(err,db){
    if (err) {
        throw err;
    }
    //


    console.log('mongodb connect...');

    // Connect socket io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        // Create function to send sstatus
        sendStatus = function(s) {
            socket.emit('status ',s)
        }
        // Get chats from mongo collection
        chat.find().limit(100).sort({_id: 1}).toArray(function(err, res){
            if (err) {
                throw err;
            }
            // Emmit the messages
            socket.emit('output ', res)
        });
        // Handle inputs events
        socket.on('input', function(data){
            let name  = data.name;
            let message = data.message;
            // Check for name and message
            if (name == '' || message == '') {
                // Send err status
                sendStatus('Please enter name and message')
            } else {
                // Insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    //Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                })
            }
        });
        // Handle clear
        socket.on('clear', function(data){
            // remove all chats from collectin
            chat.remove({},function(){
                socket.emit('cleared');
            });
        });

    });
});