import {
  clientId,
  clienSecretLink,
  redirectUrl,
  youtubeApiKey,
} from "./config.js";

const reset_btn = document.querySelector(".reset");
const send_btn = document.querySelector(".send");
const input_link = document.querySelector(".link__input");

const authUrl = "https://accounts.spotify.com/authorize";
const tokenUrl = "https://accounts.spotify.com/api/token";
const apiBaseUrl = "https://api.spotify.com/v1/";

const IDPLAYLIST = localStorage.getItem("PlaylistId");
console.log(IDPLAYLIST);
localStorage.clear();

const linksDownload = [];

const openLinkInNewTab = (url) => {
  const newTab = window.open(url, "_blank");
  if (newTab) {
    // The link was successfully opened in a new tab
    newTab.focus();
  } else {
    // Pop-up blocker prevented opening the new tab
    console.error(
      "Unable to open link in a new tab. Check your pop-up blocker settings."
    );
  }
};

const downloadFiles = async function () {
  console.log(linksDownload);
  for (const link of linksDownload) {
    openLinkInNewTab(link);
    // You can introduce a delay here if needed before opening the next link
    // For example: await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

const awaitTimeout = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const waitingForNothing = async function () {
  await awaitTimeout(20000);
  downloadFiles();
};
waitingForNothing();

const resetInputValue = function () {
  input_link.value = "";
};

const checkUrlCode = async function () {
  try {
    if (window.location.search.length === 0) return;
    const queryString = window.location.search;
    const urlParagrams = new URLSearchParams(queryString);
    const code = urlParagrams.get("code");
    const bodyGenerated = `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUrl}&client_id=${clientId}&client_secret=${clienSecretLink}`;
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // prettier-ignore
        "Authorization": `Basic ` + btoa(clientId + ":" + clienSecretLink),
      },
      body: bodyGenerated,
    });
    const data = await response.json();
    const { access_token: token } = data;
    console.log(token);
    const playlistRequestUrl = `${apiBaseUrl}playlists/${IDPLAYLIST}/tracks`;
    const playlistRequest = await fetch(playlistRequestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // prettier-ignore
        "Authorization": `Bearer ${token}`,
      },
      body: null,
    });
    const playlistdata = await playlistRequest.json();
    const { items } = playlistdata;
    const arrayItems = Object.entries(items);
    const arrayTraks = arrayItems.map(
      (arr) => `${arr[1]?.track?.name} ${arr[1]?.track?.artists?.[0]?.name}`
    );
    console.log(arrayTraks);
    const urlId = [];
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "2791a69210msh828245406a5a19bp1409c4jsnbee680482aff",
        "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
      },
    };
    const urlIdIDK = arrayTraks.map(async (el) => {
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?maxResults=1&q=${el}%20OFFICIAL%20MUSIC%20VIDEO&key=${youtubeApiKey}`
      );
      const data = await response.json();
      const { videoId } = data?.items?.[0]?.id;
      const responseDownload = await fetch(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        options
      );
      const resultDownload = await responseDownload.json();
      linksDownload.push(resultDownload.link);
      console.log(`${resultDownload.link}`);
      return `1`;
    });
  } catch (err) {
    console.log(err);
  }
};

const api = async function () {
  const scope = "user-read-private user-read-email";
  const params = {
    client_id: clientId,
    response_type: "code",
    scope: scope,
    redirect_uri: redirectUrl,
    show_dialog: true,
  };

  const queryString = Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");
  console.log(queryString);
  const authUrlCalculated = `${authUrl}?${queryString}`;
  window.location.href = authUrlCalculated;
};
window.addEventListener("load", checkUrlCode);

reset_btn.addEventListener("click", resetInputValue);

send_btn.addEventListener("click", () => {
  const link = input_link.value;
  const linkId = link.split("playlist/");
  localStorage.setItem("PlaylistId", linkId[1]);
  api();
});
