/* ===== Battle networking =====
   Two interchangeable back ends with the same interface:
   - Firebase Realtime Database (online battles across devices), used when window.FIREBASE_CONFIG is set
   - Local demo (tabs in one browser, synced through localStorage), used otherwise
   Room data: { meta:{host,seed,len,lvl,secs,state,q,qStart,round,created}, players:{uid:{name,score,streak,online,round}}, answers:{"round_q":{uid:{ok,pts,raw,vals,choice}}} } */
const BSS = {
  get(k){ try { return JSON.parse(sessionStorage.getItem("explab-b-" + k)); } catch(e) { return null; } },
  set(k, v){ try { sessionStorage.setItem("explab-b-" + k, JSON.stringify(v)); } catch(e) {} },
  del(k){ try { sessionStorage.removeItem("explab-b-" + k); } catch(e) {} }
};

async function makeFirebaseNet(cfg){
  const base = "https://www.gstatic.com/firebasejs/10.12.2/";
  const [A, Au, D] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-database.js")]);
  const app = A.initializeApp(cfg), auth = Au.getAuth(app);
  if (auth.authStateReady) await auth.authStateReady();
  if (!auth.currentUser) await Au.signInAnonymously(auth);
  const db = D.getDatabase(app), uid = auth.currentUser.uid, r = p => D.ref(db, p);
  let offset = 0, presence = null;
  D.onValue(r(".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  return {
    uid, mode:"firebase",
    serverNow: () => Date.now() + offset,
    stamp: () => D.serverTimestamp(),
    async createRoom(code, meta){ const res = await D.runTransaction(r("rooms/" + code + "/meta"), cur => cur === null ? meta : undefined); return res.committed; },
    watchRoom(code, cb){ return D.onValue(r("rooms/" + code), s => cb(s.val()), () => cb(null)); },
    setMeta(code, patch){ return D.update(r("rooms/" + code + "/meta"), patch); },
    async joinRoom(code, name, round){
      const pr = r("rooms/" + code + "/players/" + uid), snap = await D.get(pr), cur = snap.val() || { score:0, streak:0, round };
      await D.set(pr, Object.assign(cur, { name, online:true }));
      presence = D.onDisconnect(D.child(pr, "online")); presence.set(false);
    },
    cancelPresence(){ if (presence) { presence.cancel().catch(() => {}); presence = null; } },
    setPlayer(code, patch){ return D.update(r("rooms/" + code + "/players/" + uid), patch); },
    submitAnswer(code, key, data){ return D.set(r("rooms/" + code + "/answers/" + key + "/" + uid), data).catch(() => {}); },
    removeRoom(code){ return D.remove(r("rooms/" + code)); },
    leave(code){ return D.update(r("rooms/" + code + "/players/" + uid), { online:false }).catch(() => {}); }
  };
}

function makeLocalNet(){
  let uid = BSS.get("uid");
  if (!uid) { uid = "L" + Math.random().toString(36).slice(2, 10); BSS.set("uid", uid); }
  const K = c => "explab-room-" + c, watchers = {};
  const read = c => { try { return JSON.parse(localStorage.getItem(K(c))); } catch(e) { return null; } };
  const notify = c => (watchers[c] || new Set()).forEach(cb => cb(read(c)));
  const write = (c, fn) => {
    const next = fn(read(c));
    try { if (next == null) localStorage.removeItem(K(c)); else localStorage.setItem(K(c), JSON.stringify(next)); } catch(e) {}
    notify(c);
  };
  window.addEventListener("storage", e => { if (e.key && e.key.indexOf("explab-room-") === 0) notify(e.key.slice(12)); });
  return {
    uid, mode:"local",
    serverNow: () => Date.now(),
    stamp: () => Date.now(),
    async createRoom(code, meta){ let ok = false; write(code, cur => { if (cur) return cur; ok = true; return { meta, players:{}, answers:{} }; }); return ok; },
    watchRoom(code, cb){ (watchers[code] = watchers[code] || new Set()).add(cb); setTimeout(() => cb(read(code)), 0); return () => watchers[code].delete(cb); },
    async setMeta(code, patch){ write(code, cur => { if (cur) Object.assign(cur.meta, patch); return cur; }); },
    async joinRoom(code, name, round){ write(code, cur => {
      if (!cur) return cur; cur.players = cur.players || {};
      cur.players[uid] = Object.assign(cur.players[uid] || { score:0, streak:0, round }, { name, online:true }); return cur; }); },
    async setPlayer(code, patch){ write(code, cur => { if (cur && cur.players && cur.players[uid]) Object.assign(cur.players[uid], patch); return cur; }); },
    async submitAnswer(code, key, data){ write(code, cur => {
      if (!cur) return cur; cur.answers = cur.answers || {}; cur.answers[key] = cur.answers[key] || {};
      if (!cur.answers[key][uid]) cur.answers[key][uid] = data; return cur; }); },
    async removeRoom(code){ write(code, () => null); },
    cancelPresence(){},
    async leave(code){ write(code, cur => { if (cur && cur.players && cur.players[uid]) cur.players[uid].online = false; return cur; }); }
  };
}
