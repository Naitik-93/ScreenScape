let API_KEY = "6042b016";
let BASE_URL = "https://www.omdbapi.com";
let PLACEHOLDER_POSTER = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop";
let TRENDING = ["Marvel", "Batman", "Star Wars", "Harry Potter", "Lord of the Rings"];
let searchInput = document.getElementById("searchInput");
let clearBtn = document.getElementById("clearBtn");
let yearFilter = document.getElementById("yearFilter");
let typeFilter = document.getElementById("typeFilter");
let sortFilter = document.getElementById("sortFilter");
let movieGrid = document.getElementById("movieGrid");
let loader = document.getElementById("loader");
let errorMsg = document.getElementById("errorMsg");
let resultsCount = document.getElementById("resultsCount");
let themeToggle = document.getElementById("themeToggle");
let modalOverlay = document.getElementById("modalOverlay");
let modalBody = document.getElementById("modalBody");
let modalClose = document.getElementById("modalClose");

let favorites = {};
let searchTimer = null;
let movies = [];

populateYearFilter();
let randomQuery = TRENDING[Math.floor(Math.random() * TRENDING.length)];
searchInput.value = randomQuery;
fetchMovies(randomQuery);

function populateYearFilter() {
  for (let y = 2025; y >= 1996; y--) {
    let opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearFilter.appendChild(opt);
  }
}
searchInput.addEventListener("input", function () {
  clearBtn.style.display = searchInput.value ? "block" : "none";
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function () {
    fetchMovies(searchInput.value);
  }, 400);
});

clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  clearBtn.style.display = "none";
  movies = [];
  movieGrid.innerHTML = "";
  resultsCount.textContent = "0 results found";
});

typeFilter.addEventListener("change", function () {
  fetchMovies(searchInput.value);
});

yearFilter.addEventListener("change", function () {
  fetchMovies(searchInput.value);
});

sortFilter.addEventListener("change", function () {
  renderMovies();
});

themeToggle.addEventListener("click", function () {
  let html = document.documentElement;
  let isDark = html.classList.toggle("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

modalOverlay.addEventListener("click", function (e) {
  if (e.target === modalOverlay) closeModal();
});

modalClose.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal();
});

function fetchMovies(query) {
  if (!query.trim()) {
    movies = [];
    movieGrid.innerHTML = "";
    resultsCount.textContent = "0 results found";
    return;
  }

  loader.style.display = "flex";
  errorMsg.style.display = "none";
  movieGrid.innerHTML = "";

  let url = BASE_URL + "?apikey=" + API_KEY + "&s=" + encodeURIComponent(query);

  let typeVal = typeFilter.value;
  if (typeVal !== "all") url += "&type=" + typeVal;

  let yearVal = yearFilter.value;
  if (yearVal !== "all") url += "&y=" + yearVal;

  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      loader.style.display = "none";
      if (data.Response === "True" && data.Search) {
        movies = data.Search;
        resultsCount.textContent = data.totalResults + " result" + (data.totalResults !== "1" ? "s" : "") + " found";
        renderMovies();
      } else {
        movies = [];
        resultsCount.textContent = "0 results found";
        errorMsg.style.display = "block";
      }
    })
    .catch(function () {
      loader.style.display = "none";
      movies = [];
      errorMsg.querySelector(".empty-title").textContent = "Oops!";
      errorMsg.querySelector(".empty-sub").textContent = "Failed to fetch movies.";
      errorMsg.style.display = "block";
    });
}

function renderMovies() {
  movieGrid.innerHTML = "";

  let sorted = movies.slice();
  let sortVal = sortFilter.value;

  if (sortVal === "year-desc") {
    sorted.sort(function (a, b) { return parseInt(b.Year) - parseInt(a.Year); });
  } else if (sortVal === "year-asc") {
    sorted.sort(function (a, b) { return parseInt(a.Year) - parseInt(b.Year); });
  } else if (sortVal === "title-asc") {
    sorted.sort(function (a, b) { return a.Title.localeCompare(b.Title); });
  }

  sorted.forEach(function (movie, i) {
    let card = document.createElement("div");
    card.className = "movie-card";
    card.style.animationDelay = (i * 60) + "ms";

    let poster = movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER_POSTER;
    let isFav = favorites[movie.imdbID];

    card.innerHTML =
      '<div class="card-poster-wrapper">' +
        '<img class="card-poster" src="' + poster + '" alt="' + movie.Title + '" loading="lazy" />' +
        '<div class="card-gradient"></div>' +
        '<button class="card-fav-btn" data-id="' + movie.imdbID + '">' + (isFav ? "❤️" : "🤍") + '</button>' +
        '<div class="card-type-badge">' + movie.Type + '</div>' +
      '</div>' +
      '<div class="card-info">' +
        '<div class="card-title">' + movie.Title + '</div>' +
        '<div class="card-year">' + movie.Year + '</div>' +
      '</div>';

    card.addEventListener("click", function (e) {
      if (e.target.closest(".card-fav-btn")) return;
      openModal(movie.imdbID);
    });

    var favBtn = card.querySelector(".card-fav-btn");
    favBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      favorites[movie.imdbID] = !favorites[movie.imdbID];
      favBtn.textContent = favorites[movie.imdbID] ? "❤️" : "🤍";
    });

    movieGrid.appendChild(card);
  });
}