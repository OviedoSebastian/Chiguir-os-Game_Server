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

    socket.on('update-collectables', (collectables) => {
        socket.broadcast.emit('update-collectables', collectables);
    });
    
    socket.on('update-radio', (radio) => {
        socket.broadcast.emit('update-radio', radio);
    });

    socket.on('update-panino', (panino) => {
        socket.broadcast.emit('update-panino', panino);
    });

    socket.on('update-pocion', (pocion) => {
        socket.broadcast.emit('update-pocion', pocion);
    });

    socket.on('update-curao', (curao) => {
        socket.broadcast.emit('update-curao', curao);
    });

    socket.on('update-speedmenox', (speedmenox) => {
        socket.broadcast.emit('update-speedmenox', speedmenox);
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
