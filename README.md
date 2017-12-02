Playing around with Three.js 

How to run:
1. install node.js
2. download/pull this project
3. cd {base_dir}/server
4. node app.js

How to build client side:
1. cd {base_dir}/client
2. grunt build (to build without uglify) or grunt build-release

About the project:
This is meant to be a fully interactive website that has things related to me.
Currently there is only 1 completed scene (an interactive 3d music visualizer).
The about page is under work and the project page is just a place holder for now.

How to navigate the website:
You can scroll through the web page to go through the sections as any other web pages.
To "enter" into the scenes, click on the the circle in the middle of the home section.
Now you will be able to move around using W A S D and jump with space. To move the camera, press f, to lock it again, press f again.
Anytime you want to "return" press the down arrow in the top left corner.

The blue cube is your home section.
The red cube is your about section.
	- currently there are a couple of spheres in this scene, each one is suppose to generate different content
	- only red sphere generates any content right now, (a bunch of images from the shelter music video)
The yellow cube is your project section.
The black cube is your 3d music visualizer.
	- You can press ESC to bring down a list of commands and short cuts
	- in the top right corner you have your visual controls
		- decay - this will change how fast the visuals transform
		- pulse - this will emit a pulse on the expected beat
		- form - this will be the main form of the visul
		- randomize - if this is on, the form will change randomly
		- randomize Interval - this sets the rate of the form change
	- currently you must upload music to the assets/music folder under client
	- plan is to able to get streams from soundcloud, spotify, and youtube

