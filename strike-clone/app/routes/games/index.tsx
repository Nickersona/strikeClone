import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from 'react';

export const loader = async () => {
  return json({
    game: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};

// This is the relative translation instructions based on the current position
// Three cells forward from the origin
const forwardMoveSet = [
    [0,1],
    [0,2],
    [0,3]
]

// Projects a 3x2 area in front of the character
const comboMoveSet = [
    [-1,1],
    [0,1],
    [1,1],
    [-1,2],
    [0,2],
    [1,2]
]


const up = 'up';
const right = 'right';
const down = 'down';
const left = 'left';

const directions = [up, right, down, left];

const columnCount = 10
const rowCount = 10;


function transformMoveSetForCurrentPositionAndRotation(moveSet, currentPosition, rotation) {
    debugger
    const previewPositions = moveSet.map(([xTrans, yTrans]) => {
        let absolutePosition;
        const [x,y] = currentPosition;
        switch(rotation) {
            case up:
                absolutePosition = [x + xTrans, y - yTrans]
                break;
            case right:
                absolutePosition = [x + yTrans, y + xTrans ]
                break;
            case down:
                absolutePosition = [x - xTrans , y + yTrans]
                break;
            case left:
                absolutePosition = [x - yTrans, y - xTrans]
                break;
        }
        if(absolutePosition) return absolutePosition;
    })
    console.log(previewPositions || [])
    return previewPositions;
}

function useMovePreview (currentPosition, rotation) {
    const [preview, setPreview] = useState([]);
    console.log({currentPosition, rotation})
    
    useEffect(() => {
        if(currentPosition && rotation) {
            setPreview(transformMoveSetForCurrentPositionAndRotation(comboMoveSet, currentPosition, rotation))
        }
    }, [currentPosition, rotation]);
    
    function isPreviewSquare(position) {
        return preview.find((coords) =>
        coordinatesAreEqual(coords, position)
        );
    }
    
    if(!currentPosition) return {preview: [], isPreviewSquare: () => {}};
    return {preview, isPreviewSquare}
}

function Column({ children }) {
  return <div className="flex-[1_1_0] flex flex-auto flex-col">{children}</div>
}

function Cell({ children }) {
  return <div className="flex-[1_1_0] border-solid border border-indigo-600 text-center">{children}</div>
}



const obsticles = [
  [0, 6],
  [4, 3],
  [6, 0],
]

function isOutOfBounds([x, y]) {
  return (x < 0 || x >= columnCount || y < 0 || y >= rowCount);
}


function coordinatesAreEqual(coord1, coord2) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

function positionHasObstical([x, y]) {
  return obsticles.find((coords) =>
    coordinatesAreEqual(coords, [x, y])
  );
}

// currentPosition = [0, 1]
function move(currentRotation, currentPosition) {
  let nextPosition;
  if (!currentRotation) {
    return currentPosition;
  }

  const [x, y] = currentPosition;

  switch (currentRotation) {
    case up:
      nextPosition = [x, y - 1]
      break;
    case right:
      nextPosition = [x + 1, y]
      break;
    case down:
      nextPosition = [x, y + 1]
      break;
    case left:
      nextPosition = [x - 1, y]
      break;
    default:
      nextPosition = currentPosition;
      break;
  }

  if (positionHasObstical(nextPosition)) {
    nextPosition = currentPosition;
  }

  if (isOutOfBounds(nextPosition)) {
    nextPosition = currentPosition;
  }

  return nextPosition;
}

function Roomba({ rotation }) {
  let className = 'roomba'
  className += (rotation === up) ? ' ' : '';
  className += (rotation === right) ? ' rotate-90' : '';
  className += (rotation === down) ? ' rotate-180' : '';
  className += (rotation === left) ? ' -rotate-90' : '';
  return (<div className={className}>
    👆
  </div>)
}

function isAtEndOfRotation(idx, arr) {
  return idx < arr.length - 1
}

function Games() {
    const { posts } = useLoaderData();
    console.log(posts)

  const [position, setPosition] = useState([0, 0]);
  const [isPreview, setPreview] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(directions[0]);
  const progressRotation = () => {
    // TODO: Come back to this
    const rotationIdx = directions.indexOf(currentRotation);
    if (isAtEndOfRotation(rotationIdx, directions)) {
      setCurrentRotation(directions[rotationIdx + 1])
    } else {
      setCurrentRotation(directions[0])
    }
  }

  const moveRoomba = () => {
    const newPosition = move(currentRotation, position);
    // This means we've hit a wall, need to rotate
    if (newPosition === position) {
      progressRotation()
    } else {
      setPosition(newPosition);
    }
  }

  

  const {preview, isPreviewSquare} = useMovePreview(isPreview? position : null, isPreview? currentRotation : null);

  return (
    <div className="App">
      <div>
        <button onClick={progressRotation}>
          Turn Right
        </button>
        <button onClick={moveRoomba}>
          Move
        </button>
        <button onClick={() => setPreview(!isPreview)}>
          Preview Move
        </button>
      </div>
      <div className={`flex flex-row w-96 h-96`}>
        {Array.from(Array(rowCount)).map((_, x) => {
          return (
            < Column >
              {
                Array.from(Array(columnCount)).map((__, y) => {
                  return (
                    <Cell>
                      {(coordinatesAreEqual(position, [x, y])) ? <Roomba rotation={currentRotation} /> : null}
                      {positionHasObstical([x, y]) ? '🧨' : ''}
                      {isPreviewSquare([x,y]) ? '⚠️' : ''}
                    </Cell>
                  )
                })
              }
            </Column>
          );
        })}
      </div>
    </div>
  );
}

export default Games;
