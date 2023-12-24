import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();

  // 초기 창 크기를 기반으로 렌더러 크기 설정
  const initialWidth = window.innerWidth;
  const initialHeight = window.innerHeight;

const render = Render.create(
  {
    engine,
    element: document.body,
    options: {
      wireframes: false,
      background: "#F7F4C8",
      width: initialWidth,
      height: initialHeight,
    }
  }
);

const world = engine.world;

  // 초기 벽의 크기를 기반으로 설정
  const wallWidth = initialWidth * 0.05; // 전체 너비의 5%
  const wallHeight = initialHeight; // 전체 높이의 80%

  const leftWall = Bodies.rectangle(wallWidth / 2, initialHeight / 2, wallWidth, wallHeight, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
  });

  const rightWall = Bodies.rectangle(initialWidth - wallWidth / 2, initialHeight / 2, wallWidth, wallHeight, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
  });

  const ground = Bodies.rectangle(initialWidth / 2, initialHeight, initialWidth, 60, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
  });

  const topLine = Bodies.rectangle(initialWidth / 2, initialHeight * 0.2, initialWidth, 2, {
    name: "topLine",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#E6B143" }
  });

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(initialWidth/2, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {      
        if (currentBody.position.x + currentFruit.radius < initialWidth - 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
        }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

window.ontouchstart = function(event) {

  if (disableAction) {
    return;
  }

  // 터치 시작 지점 저장
  Body.setPosition(currentBody, {
    x: event.touches[0].clientX,
    y: currentBody.position.y,
  });

  currentBody.isSleeping = false;
  disableAction = true;

  setTimeout(() => {
    addFruit();
    disableAction = false;
  }, 1000);

};

// 충돌감지 처리
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          index: index + 1,
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          restitution: 0.2,
        }
      )
      World.add(world, newBody)

      if (index + 1 === 10){
        num_suika++;
      }

      if (num_suika === 2 ){
        alert("수박 두개 ㄷㄷ")
      }

    }

    if (
      !disableAction &&
      collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")
      alert("Game over")
  })
});

addFruit();
