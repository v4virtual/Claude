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
  let offset = 0, presence = null, tagPres = null;
  const tp = (c, sub) => r("tag/" + c + (sub ? "/" + sub : ""));
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
    leave(code){ return D.update(r("rooms/" + code + "/players/" + uid), { online:false }).catch(() => {}); },
    // Tag rooms: tag/CODE/{meta (host only), bots (host only), players/{uid} (each player writes their own)}
    async tagCreate(c, meta){ const res = await D.runTransaction(tp(c, "meta"), cur => cur === null ? meta : undefined); return res.committed; },
    tagPeek(c){ return D.get(tp(c, "meta")).then(s => s.val(), () => null); },
    watchTag(c, h){
      const p = tp(c, "players"), us = [
        D.onValue(tp(c, "meta"), s => h.meta(s.val()), () => h.meta(null)),
        D.onValue(tp(c, "bots"), s => h.bots(s.val() || {}), () => {}),
        D.onChildAdded(p, s => h.player(s.key, s.val())), D.onChildChanged(p, s => h.player(s.key, s.val())), D.onChildRemoved(p, s => h.player(s.key, null))];
      return () => us.forEach(u => u());
    },
    tagMeta(c, patch){ return D.update(tp(c, "meta"), patch).catch(() => {}); },
    async tagJoin(c, data){
      const pr = tp(c, "players/" + uid); await D.set(pr, data);
      if (tagPres) tagPres.cancel().catch(() => {});
      tagPres = D.onDisconnect(pr); tagPres.remove();
    },
    tagMe(c, patch){ return D.update(tp(c, "players/" + uid), patch).catch(() => {}); },
    tagBots(c, bots){ return D.set(tp(c, "bots"), bots).catch(() => {}); },
    tagLeave(c){ if (tagPres) { tagPres.cancel().catch(() => {}); tagPres = null; } return D.remove(tp(c, "players/" + uid)).catch(() => {}); },
    tagRemove(c){ return D.remove(tp(c)).catch(() => {}); }
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
  // Tag rooms use one key per writer (meta, bots, each player), so tabs never overwrite each other
  const TK = (c, s) => "mahoot-tag-" + c + "-" + s, tagW = {};
  const tread = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } };
  const tagDispatch = (k, v) => {
    const m = k.match(/^mahoot-tag-([A-Z0-9]{5})-(m|b|p-(.+))$/); if (!m) return;
    (tagW[m[1]] || new Set()).forEach(h => { if (m[2] === "m") h.meta(v); else if (m[2] === "b") h.bots(v || {}); else h.player(m[3], v); });
  };
  const twrite = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} tagDispatch(k, v); };
  const tagKeys = pre => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(pre) === 0) out.push(k); } return out; };
  window.addEventListener("storage", e => { if (e.key && e.key.indexOf("mahoot-tag-") === 0) { let v = null; try { v = JSON.parse(e.newValue); } catch(x) {} tagDispatch(e.key, v); } });
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
    async leave(code){ write(code, cur => { if (cur && cur.players && cur.players[uid]) cur.players[uid].online = false; return cur; }); },
    async tagCreate(c, meta){
      if (tread(TK(c, "m"))) return false;
      tagKeys("mahoot-tag-").filter(k => /-m$/.test(k)).forEach(k => { const m = tread(k); if (!m || Date.now() - (m.created || 0) > 6 * 3600e3) tagKeys(k.slice(0, -1)).forEach(x => localStorage.removeItem(x)); });
      twrite(TK(c, "m"), meta); return true;
    },
    async tagPeek(c){ return tread(TK(c, "m")); },
    watchTag(c, h){
      (tagW[c] = tagW[c] || new Set()).add(h);
      setTimeout(() => { if (!tagW[c].has(h)) return; h.meta(tread(TK(c, "m"))); h.bots(tread(TK(c, "b")) || {}); const pre = TK(c, "p-"); tagKeys(pre).forEach(k => h.player(k.slice(pre.length), tread(k))); }, 0);
      return () => tagW[c].delete(h);
    },
    async tagMeta(c, patch){ const m = tread(TK(c, "m")); if (m) { Object.keys(patch).forEach(k => { if (patch[k] === null) delete m[k]; else m[k] = patch[k]; }); twrite(TK(c, "m"), m); } },
    async tagJoin(c, data){ twrite(TK(c, "p-" + uid), data); },
    async tagMe(c, patch){ const k = TK(c, "p-" + uid), cur = tread(k); if (cur) twrite(k, Object.assign(cur, patch)); },
    async tagBots(c, bots){ twrite(TK(c, "b"), bots); },
    async tagLeave(c){ twrite(TK(c, "p-" + uid), null); },
    async tagRemove(c){ tagKeys("mahoot-tag-" + c + "-").forEach(k => twrite(k, null)); }
  };
}

/* One shared connection for battles and tag (Firebase allows one default app per page) */
const SHARED_NET = { note:"", promise:null };
function getSharedNet(){
  if (!SHARED_NET.promise) SHARED_NET.promise = (async () => {
    if (window.FIREBASE_CONFIG) {
      try { return await makeFirebaseNet(window.FIREBASE_CONFIG); }
      catch(e) { SHARED_NET.note = "Could not connect to Firebase (" + ((e && (e.code || e.message)) || e) + "). Games fall back to demo mode on this device."; }
    }
    return makeLocalNet();
  })();
  return SHARED_NET.promise;
}
