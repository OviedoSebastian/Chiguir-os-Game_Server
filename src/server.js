"use strict";

const { Server } = require("socket.io");

const clientUrl = "http://localhost:3000"; // Servidor Local
const clientUrlDeploy = "https://rtf-practices.vercel.app"; // Servidor de despliegue


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

    //Realiza la coneccion inicial de los jugadores
    //Funciona
    socket.on('player-connected', ()=>{
        players.push({
            id: socket.id,
            urlAvatar: io.engine.clientsCount === 1 ?
            "/assets/models/avatars/Cientific.glb":
            "/assets/models/avatars/Engineer.glb",
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

    // Manejar la actualización de la posición del objeto
    socket.on('updatePosition', (data) => {
        // Emitir la nueva posición a todos los clientes excepto al remitente
        socket.broadcast.emit('updatePosition', data);
    });

    // Manejar la recolección del objeto
    socket.on('collect-object', (objectName) => {
        if (objects[objectName]) {
            objects[objectName].visible = false;
            io.emit('object-collected', objectName); // Emitir a todos los clientes que el objeto ha sido recogido
        }
    });

    socket.on('update-collectables', (collectables) => {
        players = players.map(player => {
            if (player.id === socket.id) {
                player.collectables = collectables;
            }
            return player;
        });
        socket.broadcast.emit('update-collectables', collectables);
    });


    socket.on('disconnect', ()=>{
        console.log("Jugador desconectado");
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
