/* =====================================================
   STRIKER IQ — SCRIPT
   Organized into: data, navigation, training logic, library logic, init
   Nothing here is saved anywhere — all state lives in memory and resets
   the moment the page is refreshed or closed.
   ===================================================== */

/* ---------------------------------------------------
   1. DATA — the scenarios and drills the site is built from
   --------------------------------------------------- */

const scenarios = [
  {
    tag: "1v1 Attacking",
    situation: "You receive the ball wide on the right wing. The full-back is jockeying, showing you the outside and cutting off the pass inside. Your pace advantage is real.",
    choices: [
      { text: "Accelerate past him on the outside toward the byline", correct: true,
        feedback: "He opened the outside on purpose to slow you down, but with the byline in sight your pace beats his angle." },
      { text: "Cut inside onto your stronger foot", correct: false,
        feedback: "Cutting inside is exactly what a jockeying defender is set up to stop — you'd run straight into cover in a crowded area." },
      { text: "Play it backward to reset possession", correct: false,
        feedback: "Too cautious — you have a real advantage right now that disappears the moment the defense resets." },
      { text: "Try a step-over, then stop on the spot", correct: false,
        feedback: "Fancy footwork without a decisive next action just gives the defender time to get help." }
    ],
    reasoning: "Against a defender who jockeys and shows you a side, attack the space they're conceding rather than the side they're protecting — make them defend at your pace, not theirs."
  },
  {
    tag: "Counterattack",
    situation: "Your team just won the ball in midfield. You're sprinting into a 3v2 counterattack as the widest attacker, with the ball at your teammate's feet in the center.",
    choices: [
      { text: "Sprint into the widest open space and stay in his passing line", correct: true,
        feedback: "Spreading the width immediately stretches the two defenders and opens a passing lane before they can recover shape." },
      { text: "Drift toward the ball to ask for it", correct: false,
        feedback: "That removes your width and clogs the central space your teammate needs." },
      { text: "Stop and wait onside near the box", correct: false,
        feedback: "Standing still kills the counterattack's biggest weapon: speed before the defense resets." },
      { text: "Cut infield behind your teammate", correct: false,
        feedback: "That crosses his passing lane and confuses the timing of the whole break." }
    ],
    reasoning: "In a counterattack with a numbers advantage, spread the width immediately — defenders can't cover every lane if you stretch the pitch before they recover shape."
  },
  {
    tag: "Receiving Under Pressure",
    situation: "You receive the ball with your back to goal just outside the box, with a center-back tight behind you.",
    choices: [
      { text: "Take a touch that shields the ball and opens your body to your strongest side", correct: true,
        feedback: "This buys you time and protects the ball while giving you a clear picture before you commit to anything." },
      { text: "Try to flick it first-time without checking your surroundings", correct: false,
        feedback: "Playing blind under pressure is a high-turnover choice — you don't yet know what's actually on." },
      { text: "Hold the ball with both feet square, waiting for support", correct: false,
        feedback: "Square to the defender with no shielding, you're easy to dispossess from behind." },
      { text: "Turn immediately into the defender's pressure", correct: false,
        feedback: "Turning straight into a tight marker walks the ball right into the tackle." }
    ],
    reasoning: "Under pressure with your back to goal, your first touch should buy you time and information — shield the ball and open your body before deciding what's next, don't decide blind."
  },
  {
    tag: "Crossing",
    situation: "You beat your marker on the byline with no defenders between you and the goal line. Two teammates are arriving in the box — one at the near post, one at the penalty spot.",
    choices: [
      { text: "Drive a low, hard cross across the six-yard box", correct: true,
        feedback: "A firm low cross moving away from the goalkeeper is the hardest ball for defenders to read and clear." },
      { text: "Loop a high, floated cross to the far post", correct: false,
        feedback: "A high cross gives the goalkeeper and defenders far more time to read and attack the ball." },
      { text: "Cut the ball all the way back to the edge of the box", correct: false,
        feedback: "That wastes a clean byline chance where your teammates are already arriving in dangerous positions." },
      { text: "Try to dribble it into the net yourself", correct: false,
        feedback: "Low-percentage at this angle, and it ignores two teammates already in better scoring positions." }
    ],
    reasoning: "From the byline with runners arriving, a firm low cross across goal is hardest to defend — it moves away from the goalkeeper and gives runners a simple finish."
  },
  {
    tag: "Cutting Inside",
    situation: "You're on the left wing, right-footed, facing a full-back who's showing you the inside — daring you onto your stronger foot near the top of the box.",
    choices: [
      { text: "Recognize the setup and go outside to the byline instead", correct: true,
        feedback: "A defender inviting you onto your favored foot is usually funneling you toward cover — go where they're not ready." },
      { text: "Take the invitation and cut inside as planned", correct: false,
        feedback: "That runs straight into the space the defender and his cover are already prepared for." },
      { text: "Pass backward and reset", correct: false,
        feedback: "That gives up a good crossing angle for no real reason." },
      { text: "Attempt a rabona or trick move", correct: false,
        feedback: "Unnecessary risk with a low success rate when a simpler read is available." }
    ],
    reasoning: "Reading what the defender's setup is inviting — not just which foot you prefer — decides the right side to attack."
  },
  {
    tag: "Through Balls",
    situation: "Your striker is making a run in behind the last defender's shoulder. You have space and time on the ball just past the halfway line.",
    choices: [
      { text: "Play the through ball early, into the space in front of the run", correct: true,
        feedback: "Releasing early sends the ball to where the run is going, not where the striker currently is." },
      { text: "Wait until the striker is fully level with the defender to release it", correct: false,
        feedback: "Waiting that long lets the defender react and step up, risking offside and losing the run's momentum." },
      { text: "Dribble further before deciding", correct: false,
        feedback: "Extra touches let the defense recover shape and the run go stale." },
      { text: "Play a high, hopeful ball forward instead", correct: false,
        feedback: "A high ball is slower and harder to control than a timed ball on the ground." }
    ],
    reasoning: "Timing a through ball means passing to the space the run will reach, not to the player's current position — early release into open space beats the defense's recovery."
  },
  {
    tag: "Finishing",
    situation: "You're through on goal at a tight angle near the byline, and the goalkeeper has narrowed the near post.",
    choices: [
      { text: "Aim low and hard for the far post", correct: true,
        feedback: "The far post is away from the goalkeeper's body and the higher-percentage target at a tight angle." },
      { text: "Shoot near post, where the keeper is set", correct: false,
        feedback: "That shoots the ball straight into the part of the goal the keeper is already covering." },
      { text: "Try to dribble around the keeper entirely", correct: false,
        feedback: "Unnecessary risk when a clear shooting angle at the far post is already available." },
      { text: "Blast it high over the target area", correct: false,
        feedback: "Power without placement from a tight angle is far more likely to miss than score." }
    ],
    reasoning: "At a tight angle, the far post — away from the goalkeeper's body — is the higher-percentage target than trying to beat them at the near post."
  },
  {
    tag: "Creating Space",
    situation: "You're marked tightly by a center-back near the edge of the box, and your team has the ball on the opposite flank with a winger about to cross.",
    choices: [
      { text: "Make a sharp checking run away from goal, then burst back in as the cross comes", correct: true,
        feedback: "Changing direction just before the ball arrives breaks the marker's rhythm and creates real separation." },
      { text: "Stand still on the defender's shoulder and wait", correct: false,
        feedback: "Standing still lets the marker stay tight with no separation created." },
      { text: "Run straight toward the near post immediately", correct: false,
        feedback: "A single predictable run in one direction is easy for a tight marker to track and follow." },
      { text: "Drop deep out of the box entirely", correct: false,
        feedback: "That removes you from the scoring position just as the cross is about to arrive." }
    ],
    reasoning: "Creating separation from a tight marker usually means changing speed or direction just before the ball arrives — a check-away-then-in run breaks the defender's rhythm."
  },
  {
    tag: "Decision-Making Near the Box",
    situation: "You've dribbled to the edge of the box at an angle. A defender is closing fast, and you see a teammate free at the penalty spot plus a narrow shooting lane.",
    choices: [
      { text: "Take the shot immediately before the defender closes the lane", correct: true,
        feedback: "A real shooting lane that's about to disappear should usually be taken now, before the window closes." },
      { text: "Take an extra touch to set up a better angle", correct: false,
        feedback: "That extra touch is exactly enough time for the closing defender to block the lane." },
      { text: "Force a pass through the defender to the free teammate", correct: false,
        feedback: "A pass through traffic when a shot is already available adds unnecessary risk." },
      { text: "Cut back away from goal to avoid the defender", correct: false,
        feedback: "Retreating gives up a clear chance for no real benefit." }
    ],
    reasoning: "Near the box, a closing defender changes the calculus — a good shooting lane that's about to disappear should usually be taken now rather than risking an extra touch or a pass through traffic."
  }
];

const drills = [
  {
    name: "Far-Post Finish Repetition", category: "Finishing",
    objective: "Improve accuracy finishing at a tight angle toward the far post.",
    instructions: "Set up 10 balls at a wide angle near the byline. Strike each one first-time toward a far-post target.",
    reps: "3 sets of 10 shots", skill: "Finishing under angle constraints"
  },
  {
    name: "One-Touch Combination Finish", category: "Finishing",
    objective: "Sharpen composure finishing off a quick pass.",
    instructions: "A partner feeds ground passes into the box from varying angles. Finish first-time on goal.",
    reps: "4 sets of 8 reps", skill: "First-time finishing, composure"
  },
  {
    name: "Isolation Box 1v1", category: "1v1",
    objective: "Improve attacking a defender in tight space.",
    instructions: "Mark a small grid. The attacker starts with the ball as the defender pressures from a jockeying stance; beat them and reach the end line.",
    reps: "8-10 reps per side, rotate roles", skill: "Dribbling under pressure, reading defensive shape"
  },
  {
    name: "Read the Angle", category: "1v1",
    objective: "Practice recognizing which side a defender is inviting, then attacking the other.",
    instructions: "The defender jockeys and deliberately shows one side. The attacker must identify and attack the opposite space within 3 seconds.",
    reps: "10 reps", skill: "Decision speed, defender-reading"
  },
  {
    name: "10-Yard Burst Starts", category: "Speed & Explosiveness",
    objective: "Improve first-step acceleration from a standing start.",
    instructions: "Sprint 10 yards from a stationary position on a signal, then walk back to recover.",
    reps: "8 reps", skill: "Explosive acceleration"
  },
  {
    name: "Change-of-Direction Sprint", category: "Speed & Explosiveness",
    objective: "Train the check-and-go movement used to create separation from a marker.",
    instructions: "Sprint 5 yards, plant and cut back 5 yards, then explode forward 10 yards.",
    reps: "6 reps per side", skill: "Change of direction, separation from markers"
  },
  {
    name: "Wall Touch & Turn", category: "First Touch",
    objective: "Sharpen first touch under time pressure.",
    instructions: "Pass the ball against a wall or rebounder, control it in one touch, and turn immediately toward an imagined goal.",
    reps: "3 sets of 12", skill: "First-touch control, quick turning"
  },
  {
    name: "Receive on the Half-Turn", category: "First Touch",
    objective: "Practice receiving the ball already facing forward.",
    instructions: "A partner passes from behind or the side. Open your body and control the pass so your first touch faces forward.",
    reps: "10 reps each side", skill: "Body orientation, scanning before receiving"
  },
  {
    name: "Scan-and-Play Rondo", category: "Decision Making",
    objective: "Build the habit of scanning before every reception.",
    instructions: "Play a small possession rondo (4v1 or 4v2). Players must check over their shoulder before every reception.",
    reps: "3 rounds of 4 minutes", skill: "Scanning, quick decision-making"
  },
  {
    name: "Pass or Dribble Reaction", category: "Decision Making",
    objective: "Train fast reads under time pressure.",
    instructions: "Receive a pass with a defender closing. Within 2 seconds, decide to pass, dribble, or shoot based on the space given.",
    reps: "12 reps", skill: "Decision speed under pressure"
  }
];

/* ---------------------------------------------------
   2. NAVIGATION — switching between the site's sections
   --------------------------------------------------- */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const startButtons = document.querySelectorAll("[data-target]");
const navMenu = document.getElementById("mainNav");
const navToggle = document.getElementById("navToggle");

function showPage(pageId) {
  pages.forEach(page => page.classList.toggle("active-page", page.id === pageId));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.target === pageId));
  navMenu.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

startButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.target));
});

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

/* ---------------------------------------------------
   3. DECISION TRAINING LOGIC
   --------------------------------------------------- */

const trainingIntro = document.getElementById("trainingIntro");
const trainingActive = document.getElementById("trainingActive");
const trainingResults = document.getElementById("trainingResults");

const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");
const scoreLabel = document.getElementById("scoreLabel");
const scenarioTag = document.getElementById("scenarioTag");
const scenarioText = document.getElementById("scenarioText");
const choicesWrap = document.getElementById("choicesWrap");
const feedbackBox = document.getElementById("feedbackBox");
const feedbackVerdict = document.getElementById("feedbackVerdict");
const feedbackExplain = document.getElementById("feedbackExplain");
const feedbackReasoning = document.getElementById("feedbackReasoning");

// Session state — all of this lives only in memory and resets on refresh.
let currentIndex = 0;
let correctCount = 0;
let answered = false;

function startTraining() {
  currentIndex = 0;
  correctCount = 0;
  trainingIntro.classList.add("hidden");
  trainingResults.classList.add("hidden");
  trainingActive.classList.remove("hidden");
  renderScenario();
}

function renderScenario() {
  answered = false;
  const scenario = scenarios[currentIndex];

  progressLabel.textContent = `${currentIndex + 1} / ${scenarios.length}`;
  progressFill.style.width = `${(currentIndex / scenarios.length) * 100}%`;
  scoreLabel.textContent = correctCount;

  scenarioTag.textContent = scenario.tag;
  scenarioText.textContent = scenario.situation;

  choicesWrap.innerHTML = "";
  scenario.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => handleAnswer(index));
    choicesWrap.appendChild(btn);
  });

  feedbackBox.classList.add("hidden");
}

function handleAnswer(choiceIndex) {
  if (answered) return;
  answered = true;

  const scenario = scenarios[currentIndex];
  const choice = scenario.choices[choiceIndex];
  const allButtons = choicesWrap.querySelectorAll(".choice-btn");

  allButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === choiceIndex) {
      btn.classList.add(choice.correct ? "correct" : "incorrect");
    } else if (scenario.choices[index].correct) {
      btn.classList.add("reveal-correct");
    }
  });

  if (choice.correct) correctCount++;
  scoreLabel.textContent = correctCount;

  feedbackVerdict.textContent = choice.correct ? "Best Decision" : "Not the Best Decision";
  feedbackVerdict.className = "feedback-verdict " + (choice.correct ? "is-correct" : "is-incorrect");
  feedbackExplain.textContent = choice.feedback;
  feedbackReasoning.textContent = scenario.reasoning;

  feedbackBox.classList.remove("hidden");

  const nextBtn = document.getElementById("nextScenarioBtn");
  nextBtn.textContent = currentIndex === scenarios.length - 1 ? "See Results" : "Next Scenario";
}

function nextScenario() {
  currentIndex++;
  if (currentIndex >= scenarios.length) {
    showResults();
  } else {
    renderScenario();
  }
}

function showResults() {
  trainingActive.classList.add("hidden");
  trainingResults.classList.remove("hidden");

  const total = scenarios.length;
  const accuracy = Math.round((correctCount / total) * 100);

  document.getElementById("resultScore").textContent = `${correctCount}/${total}`;
  document.getElementById("resultAccuracy").textContent = `${accuracy}%`;
  document.getElementById("resultCorrect").textContent = correctCount;

  let message;
  if (accuracy >= 85) {
    message = "Excellent decision-making. You're consistently picking the highest-percentage option under pressure.";
  } else if (accuracy >= 60) {
    message = "Solid session. You're reading most situations well — review the reasoning on the ones you missed.";
  } else {
    message = "Good start. Decision-making is a skill like any other — run the session again and watch your reads sharpen.";
  }
  document.getElementById("resultsFeedback").textContent = message;
}

document.getElementById("beginTrainingBtn").addEventListener("click", startTraining);
document.getElementById("nextScenarioBtn").addEventListener("click", nextScenario);
document.getElementById("restartTrainingBtn").addEventListener("click", () => {
  trainingResults.classList.add("hidden");
  trainingIntro.classList.remove("hidden");
});

/* ---------------------------------------------------
   4. TRAINING LIBRARY LOGIC
   --------------------------------------------------- */

const drillsGrid = document.getElementById("drillsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

function renderDrills(category) {
  const filtered = category === "All" ? drills : drills.filter(d => d.category === category);

  drillsGrid.innerHTML = "";
  filtered.forEach(drill => {
    const card = document.createElement("div");
    card.className = "drill-card";
    card.innerHTML = `
      <span class="drill-category">${drill.category}</span>
      <h3>${drill.name}</h3>
      <p class="drill-meta"><strong>Objective:</strong> ${drill.objective}</p>
      <p class="drill-meta"><strong>Instructions:</strong> ${drill.instructions}</p>
      <p class="drill-meta"><strong>Reps/Time:</strong> ${drill.reps}</p>
      <p class="drill-meta"><strong>Develops:</strong> ${drill.skill}</p>
    `;
    drillsGrid.appendChild(card);
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderDrills(btn.dataset.filter);
  });
});

/* ---------------------------------------------------
   5. INITIALIZATION
   --------------------------------------------------- */

renderDrills("All");
