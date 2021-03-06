
var app = new Vue({
    el: '#app',
    // storing the state of the page
    data: {
        connected: false,
        ros: null,
        ws_address: 'ws://172.20.10.3:9090',
        logs: [],
        loading: false,
        topic: null,
        message: null
    },
    // helper methods to connect to ROS
    methods: {
        connect: function() {
            this.loading = true
            this.ros = new ROSLIB.Ros({
                url: this.ws_address
            })
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!')
                this.connected = true
                this.loading = false

                var statusListener = new ROSLIB.Topic({
                    ros : this.ros,
                    name : 'move_base/result',
                    messageType : 'move_base_msgs/MoveBaseActionResult'
                })

                var goalListener = new ROSLIB.Topic({
                    ros : this.ros,
                    name : 'move_base/feedback',
                    messageType : 'move_base_msgs/MoveBaseActionFeedback'
                })
                
                var viewer = new ROS2D.Viewer({
                    divID : 'map',
                    width : 600,
                    height : 600  
                })
                var gridClient = new ROS2D.OccupancyGridClient({
                    ros: this.ros,
                    rootObject: viewer.scene,
                    continuous: true
                })
                gridClient.on('change', function() {
                    viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height)
                    viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y)
                    
                })

                goalListener.subscribe(function(MoveBaseActionFeedback){
                    robotMarker.x = MoveBaseActionFeedback.feedback.base_position.pose.position.x
                    robotMarker.y = -MoveBaseActionFeedback.feedback.base_position.pose.position.y
                 })

                statusListener.subscribe(function(actionResult){
                    if (actionResult.status.status = 3) {
                        window.alert("El robot ha llegado a su destino. Presione el boton Origin una vez haya recogido su entrega. Gracias")
                    }
                 })

                var robotMarker = new ROS2D.NavigationArrow({
                    size: 0.15,
                    strokeSize: 0.008,
                    pulse: true
                })

                gridClient.rootObject.addChild(robotMarker)
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false
            })          
        },
        disconnect: function() {
            this.ros.close()
        },
        setTopic: function() {
            this.topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/move_base_simple/goal',
                messageType: 'geometry_msgs/PoseStamped'
            })
        },
        origin: function() {
            this.message = new ROSLIB.Message({
                header: {
                    frame_id: 'map'
                },
                pose:{
                    position: { x: 0, y: 0, z: 0 },
                    orientation: { x: 0, y: 0, z: 0, w: 1 },
                }
            })
            this.setTopic()
            this.topic.publish(this.message2)
            
        },
        room1: function() {
            this.message = new ROSLIB.Message({
                header: {
                    frame_id: 'map'
                },
                pose:{
                    position: { x: 3.202, y: 0.818, z: 0 },
                    orientation: { x: 0, y: 0, z: 0.479, w: 0.878}
                }
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        room2: function() {
            this.message = new ROSLIB.Message({
                header: {
                    frame_id: 'map'
                },
                pose:{
                    position: { x: 1.926, y: -0.456, z: 0 },
                    orientation: { x: 0, y: 0, z: -0.566, w: 0.824}
                }
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        room3: function() {
            this.message = new ROSLIB.Message({
                header: {
                    frame_id: 'map'
                },
                pose:{
                    position: { x: 0, y: 0, z: 0 },
                    orientation: { x: 0, y: 0, z: 0, w: 0 },
                }
            })
            this.setTopic()
            this.topic.publish(this.message)
        }
    },
    mounted() {
    },
})