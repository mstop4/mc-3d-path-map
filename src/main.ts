import { animate, setupScene } from "./setup";



function start() {
	const elements = setupScene();
	animate(elements);
}

start();