"use strict";

const { Server } = require("socket.io");

const clientUrl = "http://localhost:3000"; // Servidor Local
const clientUrlDeploy = "https://rtf-practices.vercel.app/"; // Servidor de despliegue


const port = 5000;

const io = new Server({
    cors:{
        origin: [clientUrl, clientUrlDeploy]
    },
});

/**
 * Start listening on the specified port.
 */
io.listen(port);

let players = [];

io.on('connection', (socket)=>{
    
    console.log(
        'player joined with ID',
        socket.id, ". There are " +
        io.engine.clientsCount +
        " players connected"
    );

    socket.on('player-connected', ()=>{
        players.push({
            id: socket.id,
            urlAvatar: io.engine.clientsCount === 1 ?
            "/assets/models/avatars/Engineer.glb":
            "/assets/models/avatars/Cientific.glb",
            position: null,
            rotation: null,
            animation: "Idle"
        });
        socket.emit('players-connected', players);
    })

    socket.on("moving-player", (valuesTranformPlayer) => {
        const player = players.find( player => player.id === socket.id);
        player.position = valuesTranformPlayer.position;
        player.rotation = valuesTranformPlayer.rotation;
        socket.broadcast.emit("updates-values-transform-player", player);
    })

    socket.on("change-animation", (animation) =>{
        const player = players.find( player => player.id === socket.id);
        player.animation = animation;
        socket.broadcast.emit("update-animation", player);
    })


    socket.on('disconnect', ()=>{
        players = players.filter(player =>player.id !== socket.id);
        console.log(
            "Player disconnected with ID",
            socket.id, ". There are " +
            io.engine.clientsCount +
            " players connected"
        );
        socket.emit('players-connected', players);
    })

});

io.listen(port)
