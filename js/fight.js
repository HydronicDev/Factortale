let state;
let nextState;
let musicAllowed;

let answerCorrect;
let step;
let leftFactored;
let rightFactored;
let answer;

let hud;
let buttonManager;

let musicInterval;

const ready = () => {
  state = 'CHOOSE';
  musicAllowed = true;

  answerCorrect = false;
  step = 'FIND_FACTORS';
  leftFactored = false;
  rightFactored = false;

  hud = new HUD();
  buttonManager = new ButtonManager();

  const box = new Box();
  box.setText('Expression blocks the way!');

  const equation = Equation.random();
  const arena = new Arena(() => {
    solveMenu.selection = 0;
    findFactorMenu.selection = 0;
    factorChooseMenu.selection = 0;

    state = 'CHOOSE';

    box.grow(() => {
      if (step === 'FACTOR') {
        if (leftFactored) {
          box.setText('X was factored out of the left\ngroup.')
        } else if (rightFactored) {
          box.setText(equation.correctFactors[1] + ' was factored out of the right\ngroup.')
        } else {
          box.setText(
            'Factor 1 (' + equation.correctFactors[0] + ') was grouped with A.' +
            '\n* Factor 2 (' + equation.correctFactors[1] + ') was grouped with B.'
          );
        }
      } else if (step === 'FINAL') {
        box.setText('Both groups have been factored.');
      } else if (step === 'DONE') {
        box.setText('New groups are formed.');
      } else {
        box.setText('Expression remains the same.');
      }
    });
  });

  const attack = new Attack(equation, () => {
    state = 'BATTLE';
    box.shrink(() => {
      arena.sendAttack();
    });
  });

  buttonManager.makeButton(20, textures.button.solve, textures.button.solveSel, () => {
    state = 'MENU';
    currentMenu = solveMenu;
  });

  const leftFactorMenu = () => {
    const array = shuffle([
      {
        name: 'Factor out x',
        callback: () => {
          leftFactored = true;

          if (rightFactored) {
            step = 'FINAL';
          }

          answerCorrect = true;
          attack.run();
        }
      },
      {
        name: 'Factor out ' + equation.correctFactors[0],
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: 'Factor out x\u00B2',
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: 'Factor out ' + -equation.correctFactors[0],
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      }
    ]);

    return new Menu(array, () => currentMenu = factorChooseMenu);
  };

  const rightFactorMenu = () => {
    const array = shuffle([
      {
        name: 'Factor out ' + equation.correctFactors[1],
        callback: () => {
          rightFactored = true;

          if (leftFactored) {
            step = 'FINAL';
          }

          answerCorrect = true;
          attack.run();
        }
      },
      {
        name: 'Factor out x',
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: 'Factor out ' + -equation.correctFactors[1],
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: 'Factor out ' + equation.originalC,
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      }
    ]);

    return new Menu(array, () => currentMenu = factorChooseMenu);
  };

  const factorChooseMenu = new Menu([
    {
      name: 'Left',
      callback: () => {
        if (leftFactored) {
          answerCorrect = false;
          attack.run();
        } else {
          currentMenu = leftFactorMenu();
        }
      }
    },
    {
      name: 'Right',
      callback: () => {
        if (rightFactored) {
          answerCorrect = false;
          attack.run();
        } else {
          currentMenu = rightFactorMenu();
        }
      }
    }
  ], () => currentMenu = solveMenu);

  const finalGroupsMenu = () => {
    let firstFactor = formatPlus(equation.correctFactors[0]);
    let secondFactor = formatPlus(equation.correctFactors[1]);

    answer = '(x' + secondFactor + ')(x' + firstFactor + ')';

    const array = shuffle([
      {
        name: answer,
        callback: () => {
          step = 'DONE';
          answerCorrect = true;
          attack.run();
        }
      },
      {
        name: '(x' + formatPlus(-secondFactor) + ')(x' + firstFactor + ')',
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: '(x' + secondFactor + ')(x' + -firstFactor + ')',
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      },
      {
        name: '(x' + formatPlus(-secondFactor) + ')(x' + -firstFactor + ')',
        callback: () => {
          answerCorrect = false;
          attack.run();
        }
      }
    ]);

    return new Menu(array, () => currentMenu = solveMenu);
  }

  const solveMenu = new Menu([
    {
      name: 'Find factors',
      callback: () => {
        if (step === 'FIND_FACTORS') {
          currentMenu = findFactorMenu;
        } else {
          answerCorrect = false;
          attack.run();
        }
      }
    },
    {
      name: 'Factor',
      callback: () => {
        if (step === 'FACTOR') {
          currentMenu = factorChooseMenu;
        } else {
          answerCorrect = false;
          attack.run();
        }
      }
    },
    {
      name: 'Final groups',
      callback: () => {
        if (step === 'FINAL') {
          currentMenu = finalGroupsMenu();
        } else {
          answerCorrect = false;
          attack.run();
        }
      }
    }
  ]);

  buttonManager.makeButton(183, textures.button.help, textures.button.helpSel, () => {
    switch (step) {
      case 'FIND_FACTORS':
        box.setText('Find the factors of ' + equation.c + ' which add\nup to equal ' + equation.b);
        break;

      case 'FACTOR':
        box.setText('Factor out the items in the left\nand right groups.');
        break;

      case 'FINAL':
        box.setText('Put the outer terms in one group,\nand multiply them by one of the\ncurrent groups.')
        break;

      case 'DONE':
        box.setText('You are finished, select [DONE].')
        break;
    }
  });

  const items = [
    {
      name: 'Green item',
      health: 20,
      info: 'ALWAYS CHOOSE GREEN! You\'re health\nwas maxed out.'
    },
    {
      name: 'Red item',
      health: 1,
      info: 'Imagine choosing red... +1 health\nfor you.'
    },
    {
      name: 'Party popper',
      health: 4,
      info: 'Assuming you got the answer wrong,\ngreat job! Confetti for you.\n(+4 Health)'
    },
    {
      name: 'Plug-Chug',
      health: 4,
      info: 'Thanks for your contribution to the\npluggity-chuggity machine. (+4 Health)'
    },
    {
      name: 'Record Button',
      health: 4,
      info: 'You must never forget to record.\nThis shall remind you. (+4 Health)'
    },
    {
      name: '81\u2122 Cookies',
      health: 4,
      info: 'richard81cookiepacman@wood.com/M\nthanks you. (+4 Health)'
    }
  ];

  buttonManager.makeButton(346, textures.button.item, textures.button.itemSel, () => {
    const array = [];

    items.forEach((item, i) => {
      array.push({
        name: item.name,
        callback: () => {
          items.splice(i, 1);
          hud.addHealth(item.health);
          state = 'INFO';

          nextState = () => {
            state = 'BATTLE';

            box.shrink(() => {
              arena.sendAttack();
            });
          };
          box.setText(item.info);
        }
      });
    });

    currentMenu = new Menu(array);
    state = 'MENU';
  });

  buttonManager.makeButton(510, textures.button.done, textures.button.doneSel, () => {
    if (step === 'DONE') {
      equation.free = true;
      musicAllowed = false;
      state = 'INFO';
      sounds.music.main.pause();
      sounds.music.main.currentTime = 0;
      clearInterval(musicInterval);
      sounds.spare.play();
      box.setText('YOU WON!\n* You earned 0 XP and ' + random(10) + ' gold.');
      nextState = () => {
        end();
      }
    } else {
      state = 'INFO';
      box.setText('The expression is not completed\nyet!')
      nextState = () => {
        state = 'BATTLE';

        box.shrink(() => {
          answerCorrect = false;
          arena.sendAttack();
        });
      };
    }
  });

  const factors = findFactors(equation.c);

  const factorMenuItems = [];
  factors.forEach((factor, i) => {
    let firstFactor = parseInt(factor);
    let secondFactor = factors[factors.length - i - 1];

    if (equation.c < 0) {
      secondFactor = '-' + secondFactor;
    }

    secondFactor = parseInt(secondFactor);

    let attackCallback;
    if (firstFactor + secondFactor === parseInt(equation.b)) {
      attackCallback = () => {
        answerCorrect = true;
        attack.run();
        step = 'FACTOR';
      };
      equation.correctFactors = [firstFactor, secondFactor];
    } else {
      attackCallback = () => {
        answerCorrect = false;
        attack.run();
      };
    }

    factorMenuItems.push({
      name: factor + ' & ' + secondFactor,
      callback: () => {
        attackCallback();
      }
    });
  });

  const findFactorMenu = new Menu(factorMenuItems, () => currentMenu = solveMenu);

  let currentMenu;

  sounds.music.main.play();
  musicInterval = setInterval(() => {
    if (musicAllowed) {
      sounds.music.main.pause();
      sounds.music.main.currentTime = 0;
      sounds.music.main.play();
    }
  }, 55000);

  currentFrame = {
    action: (action) => {
      switch (action) {
        case Action.CONFIRM:
          switch (state) {
            case 'CHOOSE':
              sounds.confirm.play();
              buttonManager.confirm();
              break;

            case 'MENU':
              sounds.confirm.play();
              currentMenu.confirm();
              break;

            case 'INFO':
              nextState();
              break;
          }
          break;

        case Action.CANCEL:
          if (state === 'MENU') {
            if (currentMenu.cancel() === false) {
              state = 'CHOOSE';
            }
          } else if (state === 'INFO' || state === 'CHOOSE') {
            box.complete();
          }
          break;

        case Action.LEFT:
          switch (state) {
            case 'CHOOSE':
              sounds.cycle.play();
              if (buttonManager.selected === 0) {
                buttonManager.selected = 3;
              } else {
                buttonManager.selected--;
              }
              break;

            case 'MENU':
              currentMenu.left();
              break;
          }
          break;

        case Action.RIGHT:
          switch (state) {
            case 'CHOOSE':
              sounds.cycle.play();
              if (buttonManager.selected === 3) {
                buttonManager.selected = 0;
              } else {
                buttonManager.selected++;
              }
              break;

            case 'MENU':
              currentMenu.right();
              break;
          }
          break;

        case Action.UP:
          switch (state) {
            case 'MENU':
              currentMenu.up();
              break;
          }
          break;

        case Action.DOWN:
          switch (state) {
            case 'MENU':
              currentMenu.down();
              break;
          }
          break;
      }
    },
    tick: () => {
      switch (state) {
        case 'BATTLE':
          arena.update();
          hud.update();
          break;

        case 'ATTACK':
          attack.update();
          break;
      }

      box.update();
      equation.update();
    },
    render: () => {
      const background = textures.background;
      ctx.drawImage(background, centerWidth(background.width), 15);

      buttonManager.render(state === 'CHOOSE');

      hud.render();

      ctx.fillStyle = 'white';
      ctx.textBaseline = 'top';

      box.render();
      equation.render();

      switch (state) {
        case 'MENU':
        case 'ATTACK':
          attack.render();
          currentMenu.render();
          break;

        case 'BATTLE':
          arena.render();
          break;
      }
    },
  };
};
