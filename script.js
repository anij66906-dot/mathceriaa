const STORAGE_KEY = "mathceria_progress_v1";
const levels = {
  basic: { title: "Latihan Dasar", questions: [[3,4],[6,7],[8,5],[9,2],[7,7]] },
  middle: { title: "Latihan Menengah", questions: [[12,6],[14,8],[23,4],[16,7],[25,9]] },
  advanced: { title: "Latihan Lanjutan", questions: [[-6,7],[12,-8],[-9,-5],[15,-4],[-11,6]] }
};
const evaluationQuestions = [[13,7],[18,5],[-8,9],[14,-6],[-7,-7]];
let state = loadState();
let currentLevel = null, questionIndex = 0, quizCorrect = 0, answered = false;
let evalIndex = 0, evalCorrect = 0, evalAnswered = false;

function defaultState(){ return { levels:{}, evaluation:null }; }
function loadState(){ try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); } catch { return defaultState(); } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function showPage(name){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  const titles={home:"Halo, Sahabat Matematika! 👋",materials:"Ayo pahami materinya 📘",practice:"Saatnya berlatih! ✏️",evaluation:"Tunjukkan kemampuanmu! 🏆",progress:"Lihat perkembanganmu 📊"};
  document.getElementById("pageTitle").textContent=titles[name]||"MATHCERIA";
  if(name==="progress") renderProgress();
  if(name==="practice") renderLevelStatus();
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));

function renderLevelStatus(){
  Object.keys(levels).forEach(key=>{
    const record=state.levels[key];
    document.getElementById(`status-${key}`).textContent=record?`Selesai • Skor ${record.score}/100`:"Belum dikerjakan";
  });
}
document.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>startPractice(b.dataset.level)));
function startPractice(level){
  currentLevel=level; questionIndex=0; quizCorrect=0; answered=false;
  document.getElementById("quizPanel").classList.remove("hidden");
  document.getElementById("quizLevel").textContent=levels[level].title;
  document.getElementById("feedback").textContent="";
  document.getElementById("feedback").className="feedback";
  document.getElementById("nextQuestion").classList.add("hidden");
  document.getElementById("finishQuiz").classList.add("hidden");
  document.getElementById("checkAnswer").classList.remove("hidden");
  renderQuestion();
  document.getElementById("quizPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderQuestion(){
  const [a,b]=levels[currentLevel].questions[questionIndex];
  document.getElementById("questionCounter").textContent=`Soal ${questionIndex+1} dari 5`;
  document.getElementById("questionProgress").style.width=`${(questionIndex+1)*20}%`;
  document.getElementById("questionText").textContent=`Berapakah hasil dari ${a} × ${b}?`;
  const input=document.getElementById("answerInput");input.value="";input.focus();
  document.getElementById("feedback").textContent="";document.getElementById("feedback").className="feedback";
  document.getElementById("checkAnswer").classList.remove("hidden");
  document.getElementById("nextQuestion").classList.add("hidden");
  document.getElementById("finishQuiz").classList.add("hidden");answered=false;
}
function checkPractice(){
  if(answered)return;
  const input=document.getElementById("answerInput");
  if(input.value.trim()===""){input.focus();return;}
  const [a,b]=levels[currentLevel].questions[questionIndex], answer=Number(input.value), correct=a*b;
  const feedback=document.getElementById("feedback");
  answered=true;document.getElementById("checkAnswer").classList.add("hidden");
  if(answer===correct){quizCorrect++;feedback.textContent="Benar! Hebat, pertahankan! ✨";feedback.classList.add("correct");}
  else{feedback.textContent=`Belum tepat. ${a} × ${b} = ${correct}. Coba ingat kembali konsep perkalian ya.`;feedback.classList.add("wrong");}
  if(questionIndex<4)document.getElementById("nextQuestion").classList.remove("hidden");
  else document.getElementById("finishQuiz").classList.remove("hidden");
}
document.getElementById("checkAnswer").addEventListener("click",checkPractice);
document.getElementById("answerInput").addEventListener("keydown",e=>{if(e.key==="Enter")checkPractice();});
document.getElementById("nextQuestion").addEventListener("click",()=>{questionIndex++;renderQuestion();});
document.getElementById("finishQuiz").addEventListener("click",finishPractice);
function finishPractice(){
  const score=quizCorrect*20;
  const previous=state.levels[currentLevel];
  if(!previous||score>previous.score)state.levels[currentLevel]={score,correct:quizCorrect,total:5,date:new Date().toLocaleDateString("id-ID")};
  saveState();renderLevelStatus();
  document.getElementById("questionText").textContent=`Latihan selesai! Skormu ${score}/100`;
  document.getElementById("feedback").textContent=score>=80?"Bagus sekali! Terus tingkatkan kemampuanmu.":"Terus berlatih ya. Kamu pasti bisa lebih baik!";
  document.getElementById("feedback").className=`feedback ${score>=80?"correct":"wrong"}`;
  document.getElementById("nextQuestion").classList.add("hidden");document.getElementById("finishQuiz").classList.add("hidden");
  renderProgress();
}

document.getElementById("startEvaluation").addEventListener("click",()=>{
  evalIndex=0;evalCorrect=0;evalAnswered=false;
  document.getElementById("evaluationPanel").classList.remove("hidden");
  document.getElementById("evaluationResult").classList.add("hidden");
  renderEvaluationQuestion();
});
function renderEvaluationQuestion(){
  const [a,b]=evaluationQuestions[evalIndex];
  document.getElementById("evalCounter").textContent=`Soal ${evalIndex+1} dari 5`;
  document.getElementById("evalProgress").style.width=`${(evalIndex+1)*20}%`;
  document.getElementById("evalQuestion").textContent=`Berapakah hasil dari ${a} × ${b}?`;
  document.getElementById("evalInput").value="";
  document.getElementById("evalFeedback").textContent="";
  document.getElementById("evalFeedback").className="feedback";
  document.getElementById("checkEvaluation").classList.remove("hidden");
  document.getElementById("nextEvaluation").classList.add("hidden");
  document.getElementById("finishEvaluation").classList.add("hidden");
  evalAnswered=false;
}
function checkEval(){
  if(evalAnswered)return;
  const input=document.getElementById("evalInput");if(input.value.trim()===""){input.focus();return;}
  const [a,b]=evaluationQuestions[evalIndex],correct=a*b,answer=Number(input.value);
  evalAnswered=true;document.getElementById("checkEvaluation").classList.add("hidden");
  const feedback=document.getElementById("evalFeedback");
  if(answer===correct){evalCorrect++;feedback.textContent="Jawaban benar!";feedback.classList.add("correct");}
  else{feedback.textContent=`Jawaban yang benar adalah ${correct}.`;feedback.classList.add("wrong");}
  if(evalIndex<4)document.getElementById("nextEvaluation").classList.remove("hidden");
  else document.getElementById("finishEvaluation").classList.remove("hidden");
}
document.getElementById("checkEvaluation").addEventListener("click",checkEval);
document.getElementById("evalInput").addEventListener("keydown",e=>{if(e.key==="Enter")checkEval();});
document.getElementById("nextEvaluation").addEventListener("click",()=>{evalIndex++;renderEvaluationQuestion();});
document.getElementById("finishEvaluation").addEventListener("click",()=>{
  const score=evalCorrect*20;state.evaluation={score,correct:evalCorrect,total:5,date:new Date().toLocaleDateString("id-ID")};saveState();
  document.getElementById("evaluationPanel").classList.add("hidden");
  const result=document.getElementById("evaluationResult");result.classList.remove("hidden");
  result.innerHTML=`<div class="big-emoji">🎉</div><h3>Evaluasi selesai!</h3><div class="result-score">${score}/100</div><p>${evalCorrect} dari 5 soal dijawab dengan benar.</p><p>${score>=80?"Hebat! Pemahamanmu sudah baik.":"Ayo pelajari kembali materi dan coba lagi."}</p>`;
  renderProgress();
});
function renderProgress(){
  const records=Object.values(state.levels),completed=records.length,average=completed?Math.round(records.reduce((sum,r)=>sum+r.score,0)/completed):null;
  document.getElementById("statCompleted").textContent=`${completed}/3`;
  document.getElementById("statAverage").textContent=average===null?"—":`${average}`;
  document.getElementById("statEvaluation").textContent=state.evaluation?`${state.evaluation.score}`:"—";
  const names={basic:"Latihan Dasar",middle:"Latihan Menengah",advanced:"Latihan Lanjutan"};
  const rows=Object.keys(levels).map(key=>{
    const r=state.levels[key];
    return `<div class="progress-row"><div><strong>${names[key]}</strong><small>${r?`Selesai pada ${r.date||"—"}`:"Belum dikerjakan"}</small></div><span class="score-tag">${r?`${r.score}/100`:"—"}</span></div>`;
  }).join("");
  const e=state.evaluation;
  document.getElementById("progressRows").innerHTML=rows+`<div class="progress-row"><div><strong>Evaluasi</strong><small>${e?`Terakhir dikerjakan ${e.date||"—"}`:"Belum dikerjakan"}</small></div><span class="score-tag">${e?`${e.score}/100`:"—"}</span></div>`;
}
document.getElementById("resetProgress").addEventListener("click",()=>{
  if(confirm("Yakin ingin menghapus seluruh progres yang tersimpan di browser ini?")){
    state=defaultState();saveState();renderProgress();renderLevelStatus();
  }
});
renderLevelStatus();renderProgress();
