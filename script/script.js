import { slider } from "./slider.js";

slider();
import { Velocity } from "velocity-animate";

const main_header = document.querySelector("h1");
Velocity(main_header, { opacity: 1 }, 3000);
