import { build } from "./ass";
import {
  download_comments_parallel,
  info_from_url,
  randomize,
} from "./download";

const save = function (filename: string, s: string) {
  const blob = new Blob([s], { type: "text/plain" });
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  return a.click();
};

const show_downloading = function () {
  const e = document.createElement("div");
  e.id = "orcd-downloading";
  e.innerText = "コメントをダウンロード中...";
  const s = e.style;
  s.position = "fixed";
  s.width = "100%";
  s.top = s.left = "0";
  s.textAlign = "center";
  s.padding = "16px";
  s.fontSize = "32px";
  s.fontWeight = "bold";
  s.zIndex = "99999999";
  s.color = "#333";
  s.backgroundColor = "#fff";
  s.boxShadow = "0 0 40px #000";
  return document.body.append(e);
};

const remove_downloading = function () {
  document.querySelector("#orcd-downloading")?.remove();
};

// ✅ キリル変換対象の emote（文字列部分のみ）とその変換後文字
const whitelistEmotes: Record<string, string> = {
  "oechanOPENREC": "О", // キリル O
  "kickSadge": "Ж",     // キリル ZH
};

(async function () {
  try {
    show_downloading();
    const info = await info_from_url(window.location.href);
    let comments = await download_comments_parallel(info);

    comments = comments.map((chat) => {
      let msg = chat.message;
      let converted = false;

      // キリル文字への変換
      for (const [target, replacement] of Object.entries(whitelistEmotes)) {
        if (msg.includes(target)) {
          msg = msg.replaceAll(target, replacement);
          converted = true;
        }
      }

      // emoteが含まれていて、ホワイトリストに該当しない場合は除外
      if (msg.includes("[emote:") && !converted) {
        msg = "";
      }

      chat.message = msg;
      return chat;
    });

    const randomizedComments = randomize(comments);
    const ass = build(randomizedComments, {
      font_size: 36,
      displayed_time: 5,
      outline: 3,
    });
    save(`${info.livestream.session_title}.ass`, ass);
    return remove_downloading();
  } catch (e) {
    remove_downloading();
    if (e instanceof Error) {
      return alert(e.message);
    }
  }
})();
