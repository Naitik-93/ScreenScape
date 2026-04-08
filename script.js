var API_KEY = "6042b016";
var BASE_URL = "https://www.omdbapi.com";
var PLACEHOLDER_POSTER = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop";
var TRENDING = ["Marvel", "Batman", "Star Wars", "Harry Potter", "Lord of the Rings"];

var searchInput = document.getElementById("searchInput");
var clearBtn = document.getElementById("clearBtn");
var yearFilter = document.getElementById("yearFilter");
var typeFilter = document.getElementById("typeFilter");
var sortFilter = document.getElementById("sortFilter");
var movieGrid = document.getElementById("movieGrid");
var loader = document.getElementById("loader");
var errorMsg = document.getElementById("errorMsg");
var resultsCount = document.getElementById("resultsCount");
var themeToggle = document.getElementById("themeToggle");
var modalOverlay = document.getElementById("modalOverlay");
var modalBody = document.getElementById("modalBody");
var modalClose = document.getElementById("modalClose");

var favorites = {};
var searchTimer = null;
var movies = [];

populateYearFilter();
var randomQuery = TRENDING[Math.floor(Math.random() * TRENDING.length)];
searchInput.value = randomQuery;
fetchMovies(randomQuery);

function populateYearFilter() {
  for (var y = 2025; y >= 1996; y--) {
    var opt = document.createElement("option");
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

  var url = BASE_URL + "?apikey=" + API_KEY + "&s=" + encodeURIComponent(query);

  var typeVal = typeFilter.value;
  if (typeVal !== "all") url += "&type=" + typeVal;

  var yearVal = yearFilter.value;
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

  var sorted = movies.slice();
  var sortVal = sortFilter.value;

  if (sortVal === "year-desc") {
    sorted.sort(function (a, b) { return parseInt(b.Year) - parseInt(a.Year); });
  } else if (sortVal === "year-asc") {
    sorted.sort(function (a, b) { return parseInt(a.Year) - parseInt(b.Year); });
  } else if (sortVal === "title-asc") {
    sorted.sort(function (a, b) { return a.Title.localeCompare(b.Title); });
  }

  sorted.forEach(function (movie, i) {
    var card = document.createElement("div");
    card.className = "movie-card";
    card.style.animationDelay = (i * 60) + "ms";

    var poster = movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER_POSTER;
    var isFav = favorites[movie.imdbID];

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