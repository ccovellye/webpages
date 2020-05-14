const longClickInstance = window['vue-long-click'].longClickDirective({delay: 400, interval: 50})
Vue.directive('longclick', longClickInstance)

var app = new Vue({
    el: '#app',
    // storing the state of the page
    data: {
        connected: false,
        ros: null,
        ws_address: 'ws://192.168.0.12:9090',
        logs: [],
        loading: false,
        topic: null,
        topic2: null,
        topic3: null,
        message: null,
        message2: null,
        message3: null,
        //viewer: null,
        //gridClient: null,
        //robotMarker: null,
        //poseTopic: null
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
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false
            })
            var poseTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/robot_pose',
                messageType: 'geometry_msgs/Pose'
            })
            poseTopic.subscribe(function(pose){
                console.log(pose)
            })
            var viewer = new ROS2D.Viewer({
                divID : 'map',
                width : 400,
                height : 300  
            })
            var gridClient = new ROS2D.OccupancyGridClient({
                ros: this.ros,
                rootObject: viewer.scene,
                continuous: true
            })
            gridClient.on('change', function() {
                viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
                viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
            })
            var robotMarker = new ROS2D.NavigationArrow({
                size: 12,
                strokeSize: 1,
                fillColor: createjs.Graphics.getRGB(255, 128, 0, 0.66),
                pulse: true
            })
            robotMarker.visible = false
            gridClient.rootObject.addChild(robotMarker)
            var initScaleSet = false
            var poseListener = new ROSLIB.Topic({
                ros : this.ros,
                name : '/robot_pose',
                messageType : 'geometry_msgs/Pose',
                throttle_rate : 100
              })
            
            poseListener.subscribe(function(pose) {
                robotMarker.x = pose.position.x,
                robotMarker.y = -pose.position.y
                if (!initScaleSet) {
                    robotMarker.scaleX = 1.0 / viewer.scene.scaleX
                    robotMarker.scaleY = 1.0 / viewer.scene.scaleY
                    initScaleSet = true
                }
                robotMarker.rotation = viewer.scene.rosQuaternionToGlobalTheta(pose.orientation)
                robotMarker.visible = true
            })

        },
        disconnect: function() {
            this.ros.close()
        },
        setTopic: function() {
            this.topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
        },
        setTopic2: function() {
            this.topic2 = new ROSLIB.Topic({
                ros: this.ros,
                name: '/move_base_simple/goal',
                messageType: 'geometry_msgs/PoseStamped'
            })
        },
        send: function() {
            this.message2 = new ROSLIB.Message({
                header: {
                    frame_id: 'map'
                },
                pose:{
                    position: { x: 10, y: 1, z: 0 },
                    orientation: { x: 0, y: 0, z: 0.5, w: 0.84 },
                }
            })
            this.setTopic2()
            this.topic2.publish(this.message2)
        },
        forward: function() {
            this.message = new ROSLIB.Message({
                linear: { x: 0.2, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        stop: function() {
            this.message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        backward: function() {
            this.message = new ROSLIB.Message({
                linear: { x: -0.2, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        turnLeft: function() {
            this.message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0.35, },
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
        turnRight: function() {
            this.message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: -0.35, },
            })
            this.setTopic()
            this.topic.publish(this.message)
        },
    },
    mounted() {
    },
})