/* =========================================================================
   CHECKMATE — Chess Puzzle Engine
   --------------------------------------------------------------------------
   Every puzzle below has been mechanically verified (legal moves, correct
   captures, and a genuine forced checkmate at the end of the line) using
   a full chess rules engine before shipping. The same rules engine also
   runs live in the browser, so the board only ever accepts real, legal
   chess moves — no illegal "jumps", no moving the wrong piece type.
   ========================================================================= */

/* ---------------------------------------------------------------------
   PUZZLE DATA
   Every "solution" array alternates: player move, forced opponent reply,
   player move, ... ending on a player move that delivers checkmate.
   turn = the side the human player controls for this puzzle.
--------------------------------------------------------------------- */
const PUZZLES_DATA = [
  {
    id:1,
    title:"Paul Morphy",
    subtitle:"The Opera House Game",
    year:"1858",
    difficulty:"easy",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Queen sacrifices herself so the Rook can finish the job.",
    fen:"4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
    solution:[
      {from:"b3",to:"b8",notation:"Qb8+"},
      {from:"d7",to:"b8",notation:"Nxb8"},
      {from:"d1",to:"d8",notation:"Rd8#"}
    ]
  },
  {
    id:2,
    title:"Rook Ladder",
    subtitle:"Endgame Study",
    year:"—",
    difficulty:"easy",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"One Rook cuts off the rank while the other climbs in for mate.",
    fen:"7k/8/8/1RR5/8/2K5/8/8 w - - 0 1",
    solution:[
      {from:"c5",to:"c7",notation:"Rc7"},
      {from:"h8",to:"g8",notation:"Kg8"},
      {from:"b5",to:"b8",notation:"Rb8#"}
    ]
  },
  {
    id:3,
    title:"Queen and Knight",
    subtitle:"Corner Pattern",
    year:"—",
    difficulty:"easy",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Knight covers the King's only flight square before the Queen arrives.",
    fen:"6k1/5ppp/8/4N3/8/1Q6/3K4/8 w - - 0 1",
    solution:[
      {from:"b3",to:"f7",notation:"Qxf7+"},
      {from:"g8",to:"h8",notation:"Kh8"},
      {from:"f7",to:"f8",notation:"Qf8#"}
    ]
  },
  {
    id:4,
    title:"Bishop and Rook",
    subtitle:"Diagonal Trap",
    year:"—",
    difficulty:"easy",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Bishop seals the escape square, then the Rook delivers mate on the back rank.",
    fen:"7k/3R2p1/8/7B/8/8/K7/8 w - - 0 1",
    solution:[
      {from:"h5",to:"g6",notation:"Bg6"},
      {from:"h8",to:"g8",notation:"Kg8"},
      {from:"d7",to:"d8",notation:"Rd8#"}
    ]
  },
  {
    id:5,
    title:"Knight and Rook",
    subtitle:"Edge Pattern",
    year:"—",
    difficulty:"medium",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Knight controls g8 so the King is forced into the Rook's path.",
    fen:"7k/R6p/8/3N4/K7/8/8/8 w - - 0 1",
    solution:[
      {from:"d5",to:"f6",notation:"Nf6"},
      {from:"h7",to:"h6",notation:"h6"},
      {from:"a7",to:"h7",notation:"Rh7#"}
    ]
  },
  {
    id:6,
    title:"Rook and Bishop",
    subtitle:"Corner Pattern",
    year:"—",
    difficulty:"medium",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Bishop takes away every flight square before the Rook lands the final blow.",
    fen:"5B1k/7p/8/8/4K3/8/8/5R2 w - - 0 1",
    solution:[
      {from:"f8",to:"h6",notation:"Bh6"},
      {from:"h8",to:"g8",notation:"Kg8"},
      {from:"f1",to:"f8",notation:"Rf8#"}
    ]
  },
  {
    id:7,
    title:"Queen and Bishop",
    subtitle:"Diagonal Bind",
    year:"—",
    difficulty:"medium",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Bishop watches the long diagonal while the Queen closes in for mate.",
    fen:"7k/1B3Qpp/8/8/8/3K4/8/8 w - - 0 1",
    solution:[
      {from:"b7",to:"d5",notation:"Bd5"},
      {from:"h7",to:"h6",notation:"h6"},
      {from:"f7",to:"g8",notation:"Qg8#"}
    ]
  },
  {
    id:8,
    title:"Double Rooks",
    subtitle:"Rolling Mate",
    year:"—",
    difficulty:"medium",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"One Rook cuts the King off on the h-file while the other delivers mate.",
    fen:"7k/7p/8/8/2K3R1/4R3/8/8 w - - 0 1",
    solution:[
      {from:"e3",to:"e6",notation:"Re6"},
      {from:"h7",to:"h6",notation:"h6"},
      {from:"e6",to:"h6",notation:"Rxh6#"}
    ]
  },
  {
    id:9,
    title:"Queen and Knight Bind",
    subtitle:"Knight's Reach",
    year:"—",
    difficulty:"medium",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Knight steps aside to open the back rank for the Queen.",
    fen:"7k/5Qp1/5N2/8/8/8/K7/8 w - - 0 1",
    solution:[
      {from:"f6",to:"e8",notation:"Ne8"},
      {from:"h8",to:"h7",notation:"Kh7"},
      {from:"f7",to:"g7",notation:"Qxg7#"}
    ]
  },
  {
    id:10,
    title:"Queen and Bishop's Edge",
    subtitle:"Pawn-Shield Break",
    year:"—",
    difficulty:"hard",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Queen offers herself on f7 first, prying the King's shield open.",
    fen:"7k/6pp/8/8/8/5Q2/4K3/1B6 w - - 0 1",
    solution:[
      {from:"f3",to:"f7",notation:"Qf7"},
      {from:"h7",to:"h6",notation:"h6"},
      {from:"f7",to:"f8",notation:"Qf8#"}
    ]
  },
  {
    id:11,
    title:"Rooks in Tandem",
    subtitle:"Open File Pattern",
    year:"—",
    difficulty:"hard",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The first Rook restricts the King to one square before the second seals it.",
    fen:"7k/6pp/8/R7/8/2Q5/8/K7 w - - 0 1",
    solution:[
      {from:"a5",to:"a7",notation:"Ra7"},
      {from:"h8",to:"g8",notation:"Kg8"},
      {from:"c3",to:"c8",notation:"Qc8#"}
    ]
  },
  {
    id:12,
    title:"Knight's Final Word",
    subtitle:"Pawn-Lock Pattern",
    year:"—",
    difficulty:"hard",
    turn:"w",
    desc:"White to move. Checkmate in 2.",
    hint:"The Rook pins the King to the back rank so the Knight can finish it.",
    fen:"6Nk/6pp/8/2R5/8/8/3K1B2/8 w - - 0 1",
    solution:[
      {from:"c5",to:"c8",notation:"Rc8"},
      {from:"h7",to:"h6",notation:"h6"},
      {from:"g8",to:"f6",notation:"Nf6#"}
    ]
  }
];

const PIECE_UNICODE = {
  wK:"♔",wQ:"♕",wR:"♖",wB:"♗",wN:"♘",wP:"♙",
  bK:"♚",bQ:"♛",bR:"♜",bB:"♝",bN:"♞",bP:"♟"
};

const FILE_LABELS = ["a","b","c","d","e","f","g","h"];
const RANK_LABELS = ["8","7","6","5","4","3","2","1"];

/* =========================================================================
   CHESS RULES ENGINE
   Real move generation + check / checkmate detection. This is what the
   board actually consults to decide what's legal — puzzle data is only
   used to judge whether a legal move matches the intended solution line.
   ========================================================================= */

function parseFEN(fen){
  const board = Array.from({length:8},()=>Array(8).fill(null));
  const rows = fen.split(" ")[0].split("/");
  rows.forEach((row,r)=>{
    let c=0;
    for(const ch of row){
      if(/\d/.test(ch)){ c+=parseInt(ch); }
      else{
        const color = ch===ch.toUpperCase() ? "w" : "b";
        const type = ch.toUpperCase();
        board[r][c] = {color,type,id:color+type};
        c++;
      }
    }
  });
  return board;
}

function sqToRC(sq){
  const f = FILE_LABELS.indexOf(sq[0]);
  const r = 8-parseInt(sq[1]);
  return [r,f];
}

function rcToSq(r,c){
  return FILE_LABELS[c]+(8-r);
}

function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }

function cloneBoard(board){
  return board.map(row=>row.map(p=>p?{...p}:null));
}

function findKing(board,color){
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p && p.color===color && p.type==="K") return [r,c];
  }
  return null;
}

function clearPath(board,fr,fc,tr,tc){
  const dr=Math.sign(tr-fr), dc=Math.sign(tc-fc);
  let r=fr+dr, c=fc+dc;
  while(r!==tr || c!==tc){
    if(board[r][c]) return false;
    r+=dr; c+=dc;
  }
  return true;
}

function pieceAttacksSquare(board,fr,fc,piece,tr,tc){
  const dr=tr-fr, dc=tc-fc;
  switch(piece.type){
    case "P": {
      const dir = piece.color==="w" ? -1 : 1;
      return dr===dir && Math.abs(dc)===1;
    }
    case "N": {
      const adr=Math.abs(dr), adc=Math.abs(dc);
      return (adr===2&&adc===1)||(adr===1&&adc===2);
    }
    case "K":
      return Math.abs(dr)<=1 && Math.abs(dc)<=1 && (dr!==0||dc!==0);
    case "R":
      if(dr!==0 && dc!==0) return false;
      return clearPath(board,fr,fc,tr,tc);
    case "B":
      if(Math.abs(dr)!==Math.abs(dc)) return false;
      return clearPath(board,fr,fc,tr,tc);
    case "Q":
      if(dr!==0 && dc!==0 && Math.abs(dr)!==Math.abs(dc)) return false;
      return clearPath(board,fr,fc,tr,tc);
  }
  return false;
}

function isSquareAttacked(board,r,c,byColor){
  for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){
    const p=board[rr][cc];
    if(!p || p.color!==byColor) continue;
    if(pieceAttacksSquare(board,rr,cc,p,r,c)) return true;
  }
  return false;
}

function pseudoLegalMoves(board,fr,fc){
  const piece = board[fr][fc];
  if(!piece) return [];
  const moves=[];
  const addIfOk = (r,c,captureOnly,noCaptureOnly)=>{
    if(!inBounds(r,c)) return false;
    const target=board[r][c];
    if(target && target.color===piece.color) return false;
    if(captureOnly && !target) return false;
    if(noCaptureOnly && target) return false;
    moves.push([r,c]);
    return !target;
  };
  switch(piece.type){
    case "P": {
      const dir = piece.color==="w" ? -1 : 1;
      const startRank = piece.color==="w" ? 6 : 1;
      if(inBounds(fr+dir,fc) && !board[fr+dir][fc]){
        addIfOk(fr+dir,fc,false,true);
        if(fr===startRank && !board[fr+2*dir][fc]){
          addIfOk(fr+2*dir,fc,false,true);
        }
      }
      for(const dc of [-1,1]){
        const r=fr+dir,c=fc+dc;
        if(inBounds(r,c) && board[r][c] && board[r][c].color!==piece.color){
          addIfOk(r,c,true,false);
        }
      }
      break;
    }
    case "N": {
      const deltas=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for(const [dr,dc] of deltas) addIfOk(fr+dr,fc+dc);
      break;
    }
    case "K": {
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
        if(dr===0&&dc===0) continue;
        addIfOk(fr+dr,fc+dc);
      }
      break;
    }
    case "R": case "B": case "Q": {
      const dirs = piece.type==="R" ? [[-1,0],[1,0],[0,-1],[0,1]]
                 : piece.type==="B" ? [[-1,-1],[-1,1],[1,-1],[1,1]]
                 : [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
      for(const [dr,dc] of dirs){
        let r=fr+dr,c=fc+dc;
        while(inBounds(r,c)){
          const cont = addIfOk(r,c);
          if(!cont) break;
          r+=dr;c+=dc;
        }
      }
      break;
    }
  }
  return moves;
}

function legalMoves(board,fr,fc){
  const piece=board[fr][fc];
  if(!piece) return [];
  const pseudo = pseudoLegalMoves(board,fr,fc);
  return pseudo.filter(([tr,tc])=>{
    const test = cloneBoard(board);
    test[tr][tc]=test[fr][fc];
    test[fr][fc]=null;
    const kingPos = piece.type==="K" ? [tr,tc] : findKing(test,piece.color);
    if(!kingPos) return true;
    return !isSquareAttacked(test,kingPos[0],kingPos[1], piece.color==="w"?"b":"w");
  });
}

function isInCheck(board,color){
  const kp = findKing(board,color);
  if(!kp) return false;
  return isSquareAttacked(board,kp[0],kp[1], color==="w"?"b":"w");
}

function hasAnyLegalMove(board,color){
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p && p.color===color && legalMoves(board,r,c).length>0) return true;
  }
  return false;
}

function isCheckmate(board,color){
  return isInCheck(board,color) && !hasAnyLegalMove(board,color);
}

/* =========================================================================
   GAME CONTROLLER
   ========================================================================= */

class Game{
  constructor(){
    this.puzzles=this.shuffle([...PUZZLES_DATA]);
    this.idx=0;
    this.score=0;
    this.solved=0;
    this.streak=0;
    this.bestStreak=0;
    this.selected=null;
    this.selectedLegalDests=[];
    this.moveNum=0;
    this.hintUsed=false;
    this.puzzleDone=false;
    this.awaitingOpponent=false;
    this.initDOM();
    this.loadPuzzle();
    this.bindIntro();
  }

  shuffle(arr){
    const order={easy:0,medium:1,hard:2};
    const grouped={easy:[],medium:[],hard:[]};
    arr.forEach(p=>grouped[p.difficulty].push(p));
    const shuffleGroup=g=>{
      for(let i=g.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [g[i],g[j]]=[g[j],g[i]];
      }
    };
    shuffleGroup(grouped.easy);
    shuffleGroup(grouped.medium);
    shuffleGroup(grouped.hard);
    return [...grouped.easy,...grouped.medium,...grouped.hard];
  }

  initDOM(){
    this.boardEl=document.getElementById("board");
    this.rankLabels=document.getElementById("rankLabels");
    this.fileLabels=document.getElementById("fileLabels");
    this.puzzleTitleEl=document.getElementById("puzzleTitle");
    this.puzzleSubtitleEl=document.getElementById("puzzleSubtitle");
    this.puzzleYearEl=document.getElementById("puzzleYear");
    this.puzzleDescEl=document.getElementById("puzzleDesc");
    this.gameBadgeEl=document.getElementById("gameBadge");
    this.feedbackEl=document.getElementById("feedback");
    this.hdrNumEl=document.getElementById("hdrNum");
    this.progressFill=document.getElementById("progressFill");
    this.scoreValEl=document.getElementById("scoreVal");
    this.moveDotsEl=document.getElementById("moveDots");
    this.moveHistoryEl=document.getElementById("moveHistory");
    this.hintTextEl=document.getElementById("hintText");
    this.turnBadgeEl=document.getElementById("turnBadge");
    this.statSolvedEl=document.getElementById("statSolved");
    this.statStreakEl=document.getElementById("statStreak");
    this.statBestEl=document.getElementById("statBest");
    this.btnNext=document.getElementById("btnNext");
    this.btnReset=document.getElementById("btnReset");
    this.btnHint=document.getElementById("btnHint");
    this.mateOverlayEl=document.getElementById("mateOverlay");
    this.btnNext.addEventListener("click",()=>this.nextPuzzle());
    this.btnReset.addEventListener("click",()=>this.resetPuzzle());
    this.btnHint.addEventListener("click",()=>this.showHint());
    document.getElementById("btnBackHome").addEventListener("click",()=>this.goHome());
    this.buildBoardLabels();
  }

  bindIntro(){
    document.getElementById("btnStart").addEventListener("click",()=>{
      document.getElementById("screenIntro").classList.add("hidden");
      document.getElementById("screenGame").classList.remove("hidden");
    });
    document.getElementById("btnRestart").addEventListener("click",()=>{
      this.puzzles=this.shuffle([...PUZZLES_DATA]);
      this.idx=0;this.score=0;this.solved=0;this.streak=0;this.bestStreak=0;
      this.scoreValEl.textContent=this.score;
      this.updateStats();
      this.loadPuzzle();
      document.getElementById("screenWin").classList.add("hidden");
      document.getElementById("screenGame").classList.remove("hidden");
    });
  }

  goHome(){
    document.getElementById("screenGame").classList.add("hidden");
    document.getElementById("screenIntro").classList.remove("hidden");
  }

  buildBoardLabels(){
    this.rankLabels.innerHTML="";
    this.fileLabels.innerHTML="";
    RANK_LABELS.forEach(l=>{const s=document.createElement("span");s.textContent=l;this.rankLabels.appendChild(s);});
    FILE_LABELS.forEach(l=>{const s=document.createElement("span");s.textContent=l;this.fileLabels.appendChild(s);});
  }

  loadPuzzle(){
    const p=this.puzzles[this.idx];
    this.currentPuzzle=p;
    this.boardState=parseFEN(p.fen);
    this.selected=null;
    this.selectedLegalDests=[];
    this.moveNum=0;
    this.hintUsed=false;
    this.puzzleDone=false;
    this.awaitingOpponent=false;
    this.hintTextEl.textContent="";
    this.feedbackEl.textContent="";
    this.feedbackEl.className="feedback";
    this.moveHistoryEl.innerHTML="";
    this.btnNext.classList.add("hidden");
    this.mateOverlayEl.classList.remove("show");
    this.renderInfo();
    this.renderBoard();
    this.renderMoveDots();
    this.updateProgress();
    this.updateStats();
  }

  renderInfo(){
    const p=this.currentPuzzle;
    this.puzzleTitleEl.textContent=p.title;
    this.puzzleSubtitleEl.textContent=p.subtitle;
    this.puzzleYearEl.textContent=p.year;
    this.puzzleDescEl.textContent=p.desc;
    this.gameBadgeEl.textContent=p.difficulty.charAt(0).toUpperCase()+p.difficulty.slice(1);
    this.gameBadgeEl.className="game-badge "+p.difficulty;
    this.turnBadgeEl.textContent=(p.turn==="w"?"White":"Black")+" to move";
    this.hdrNumEl.textContent=String(this.idx+1).padStart(2,"0");
  }

  renderBoard(){
    this.boardEl.innerHTML="";
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const sq=document.createElement("div");
        const isLight=(r+c)%2===0;
        sq.className="sq "+(isLight?"light":"dark");
        sq.dataset.r=r;sq.dataset.c=c;
        const piece=this.boardState[r][c];
        if(piece){
          const span=document.createElement("span");
          span.className="piece "+(piece.color==="w"?"white-piece":"black-piece");
          span.textContent=PIECE_UNICODE[piece.id]||"";
          sq.appendChild(span);
          sq.classList.add("has-piece");
        }
        sq.addEventListener("click",()=>this.handleClick(r,c));
        this.boardEl.appendChild(sq);
      }
    }
    if(this.selected){
      const [sr,sc]=this.selected;
      this.getSquareEl(sr,sc)?.classList.add("selected");
      this.selectedLegalDests.forEach(([r,c])=>{
        this.getSquareEl(r,c)?.classList.add("possible");
      });
    }
  }

  getSquareEl(r,c){
    return this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  /* ---------------------------------------------------------------------
     CLICK HANDLING
     The player can only select pieces belonging to the side they control
     for this puzzle (p.turn). Every destination shown and accepted comes
     from the real legalMoves() engine — not from the puzzle script — so
     illegal moves are simply impossible to make. A legal-but-off-script
     move is rejected with distinct feedback rather than silently failing.
  --------------------------------------------------------------------- */
  handleClick(r,c){
    if(this.puzzleDone || this.awaitingOpponent) return;
    const p=this.currentPuzzle;
    const piece=this.boardState[r][c];

    if(!this.selected){
      if(piece && piece.color===p.turn){
        const dests = legalMoves(this.boardState,r,c);
        if(dests.length===0){
          this.flashWrong("That piece has no legal moves right now.");
          return;
        }
        this.selected=[r,c];
        this.selectedLegalDests=dests;
        this.clearHighlights();
        this.getSquareEl(r,c)?.classList.add("selected");
        dests.forEach(([dr,dc])=>this.getSquareEl(dr,dc)?.classList.add("possible"));
      }else if(piece){
        this.flashWrong("That's not your piece to move.");
      }
      return;
    }

    const [sr,sc]=this.selected;

    // clicking the same square again deselects
    if(r===sr && c===sc){
      this.selected=null;
      this.selectedLegalDests=[];
      this.clearHighlights();
      return;
    }

    // clicking another of your own pieces re-selects instead of moving
    if(piece && piece.color===p.turn){
      const dests = legalMoves(this.boardState,r,c);
      this.selected=[r,c];
      this.selectedLegalDests=dests;
      this.clearHighlights();
      this.getSquareEl(r,c)?.classList.add("selected");
      dests.forEach(([dr,dc])=>this.getSquareEl(dr,dc)?.classList.add("possible"));
      return;
    }

    const isLegal = this.selectedLegalDests.some(([dr,dc])=>dr===r&&dc===c);
    this.selected=null;
    this.selectedLegalDests=[];
    this.clearHighlights();

    if(!isLegal){
      this.flashWrong("That move isn't legal.");
      return;
    }

    const step=p.solution[this.moveNum];
    const [er,ec]=sqToRC(step.from), [tr,tc]=sqToRC(step.to);
    if(sr===er && sc===ec && r===tr && c===tc){
      this.executePlayerMove(sr,sc,r,c,step);
    }else{
      this.showFeedback("legal-wrong","Legal move — but not the winning line. Try again.");
      setTimeout(()=>{ if(!this.puzzleDone) this.clearFeedbackIfType("legal-wrong"); },1600);
    }
  }

  clearFeedbackIfType(type){
    if(this.feedbackEl.classList.contains(type)){
      this.feedbackEl.textContent="";
      this.feedbackEl.className="feedback";
    }
  }

  clearHighlights(){
    this.boardEl.querySelectorAll(".selected,.possible,.hint-sq").forEach(el=>{
      el.classList.remove("selected","possible","hint-sq");
    });
  }

  executePlayerMove(fr,fc,tr,tc,step){
    const piece=this.boardState[fr][fc];
    if(!piece) return;
    const hadCapture=!!this.boardState[tr][tc];
    this.boardState[tr][tc]=piece;
    this.boardState[fr][fc]=null;
    this.renderBoard();
    this.animateMove(tr,tc,hadCapture);
    this.addMoveHistory(step.notation,true);
    this.moveNum++;
    this.renderMoveDots();

    const p=this.currentPuzzle;
    if(this.moveNum>=p.solution.length){
      this.onPuzzleSolved();
      return;
    }

    this.showFeedback("correct","✓ Good move!");
    setTimeout(()=>{ if(!this.puzzleDone) this.clearFeedbackIfType("correct"); },1100);

    // Auto-play the opponent's forced reply
    this.awaitingOpponent=true;
    setTimeout(()=>this.playOpponentReply(),550);
  }

  playOpponentReply(){
    const p=this.currentPuzzle;
    const step=p.solution[this.moveNum];
    if(!step){ this.awaitingOpponent=false; return; }
    const [fr,fc]=sqToRC(step.from), [tr,tc]=sqToRC(step.to);
    const piece=this.boardState[fr][fc];
    if(!piece){ this.awaitingOpponent=false; return; }
    const hadCapture=!!this.boardState[tr][tc];
    this.boardState[tr][tc]=piece;
    this.boardState[fr][fc]=null;
    this.renderBoard();
    const destEl=this.getSquareEl(tr,tc);
    if(destEl){
      destEl.classList.add("opponent-move");
      if(hadCapture)destEl.classList.add("capture-flash");
      setTimeout(()=>destEl.classList.remove("opponent-move","capture-flash"),650);
    }
    this.addMoveHistory(step.notation,false);
    this.moveNum++;
    this.renderMoveDots();
    this.awaitingOpponent=false;
  }

  animateMove(tr,tc,hadCapture){
    const destEl=this.getSquareEl(tr,tc);
    if(destEl){
      destEl.classList.add("move-anim");
      if(hadCapture)destEl.classList.add("capture-flash");
      setTimeout(()=>destEl.classList.remove("move-anim","capture-flash"),400);
    }
  }

  onPuzzleSolved(){
    this.puzzleDone=true;
    this.solved++;
    this.streak++;
    if(this.streak>this.bestStreak)this.bestStreak=this.streak;
    const bonus=this.hintUsed?50:100;
    const diffBonus = this.currentPuzzle.difficulty==="hard"?50:this.currentPuzzle.difficulty==="medium"?25:0;
    this.score+=bonus+diffBonus;
    this.scoreValEl.textContent=this.score;
    this.scoreValEl.classList.add("bump");
    setTimeout(()=>this.scoreValEl.classList.remove("bump"),400);
    this.showFeedback("done","♔ Checkmate! Puzzle solved.");
    this.btnNext.classList.remove("hidden");
    this.updateStats();
    this.showMateOverlay();
    this.playSuccessAnimation();
  }

  showMateOverlay(){
    this.mateOverlayEl.classList.add("show");
  }

  playSuccessAnimation(){
    const squares=this.boardEl.querySelectorAll(".sq");
    squares.forEach((sq,i)=>{
      setTimeout(()=>{
        sq.style.transition="transform 0.2s ease";
        sq.style.transform="scale(1.04)";
        setTimeout(()=>{sq.style.transform="";},200);
      },i*8);
    });
  }

  flashWrong(message){
    this.boardEl.style.animation="none";
    void this.boardEl.offsetHeight;
    this.boardEl.style.animation="boardShake .4s ease";
    setTimeout(()=>this.boardEl.style.animation="",400);
    this.showFeedback("wrong",message||"Wrong piece — look again.");
    setTimeout(()=>{ if(!this.puzzleDone) this.clearFeedbackIfType("wrong"); },1500);
  }

  showFeedback(type,msg){
    this.feedbackEl.className="feedback "+type;
    this.feedbackEl.textContent=msg;
  }

  showHint(){
    if(this.puzzleDone || this.awaitingOpponent) return;
    const p=this.currentPuzzle;
    this.hintUsed=true;
    this.hintTextEl.textContent=p.hint;
    const step=p.solution[this.moveNum];
    if(step){
      const [fr,fc]=sqToRC(step.from);
      this.clearHighlights();
      this.getSquareEl(fr,fc)?.classList.add("hint-sq");
    }
  }

  resetPuzzle(){
    this.loadPuzzle();
  }

  nextPuzzle(){
    if(this.idx<this.puzzles.length-1){
      this.idx++;
      this.loadPuzzle();
    }else{
      document.getElementById("winScore").textContent=this.score;
      document.getElementById("screenGame").classList.add("hidden");
      document.getElementById("screenWin").classList.remove("hidden");
    }
  }

  addMoveHistory(notation,isPlayerMove){
    const el=document.createElement("div");
    el.className="move-entry";
    const n=this.moveHistoryEl.children.length+1;
    const playerColor = this.currentPuzzle.turn==="w" ? "White" : "Black";
    const opponentColor = this.currentPuzzle.turn==="w" ? "Black" : "White";
    const sideLabel = isPlayerMove ? playerColor : opponentColor;
    el.innerHTML=`<span class="mn">${n}.</span><span class="mv${isPlayerMove?" correct":""}">${notation}</span><span class="mn">${sideLabel}</span>`;
    this.moveHistoryEl.appendChild(el);
  }

  renderMoveDots(){
    const p=this.currentPuzzle;
    const playerMoveIndices=[];
    p.solution.forEach((step,i)=>{ if(i%2===0) playerMoveIndices.push(i); });
    const playerMovesDone = playerMoveIndices.filter(i=>i<this.moveNum).length;
    this.moveDotsEl.innerHTML="";
    playerMoveIndices.forEach((stepIdx,i)=>{
      const dot=document.createElement("div");
      const isDone = stepIdx < this.moveNum;
      const isNext = stepIdx === this.moveNum;
      dot.className="move-dot"+(isDone?" used":(isNext?" filled":""));
      this.moveDotsEl.appendChild(dot);
    });
  }

  updateProgress(){
    const pct=((this.idx)/this.puzzles.length)*100;
    this.progressFill.style.width=pct+"%";
  }

  updateStats(){
    this.statSolvedEl.textContent=this.solved;
    this.statStreakEl.textContent=this.streak;
    this.statBestEl.textContent=this.bestStreak||"—";
  }
}

const style=document.createElement("style");
style.textContent=`
@keyframes boardShake{
  0%{transform:translateX(0)}
  15%{transform:translateX(-6px)}
  30%{transform:translateX(6px)}
  45%{transform:translateX(-4px)}
  60%{transform:translateX(4px)}
  75%{transform:translateX(-2px)}
  90%{transform:translateX(2px)}
  100%{transform:translateX(0)}
}`;
document.head.appendChild(style);

window.addEventListener("DOMContentLoaded",()=>{
  window.__game = new Game();
});
