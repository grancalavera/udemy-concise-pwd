if (navigator.serviceWorker) {
  navigator.serviceWorker.register("sw.js").catch(console.error);
}

async function giphyCacheClean(giphys) {
  if (navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.getRegistration();
    registration.active?.postMessage({ action: "cleanGiphyCache", giphys });
  }
}

// Giphy API object
var giphy = {
  url: "https://api.giphy.com/v1/gifs/trending",
  query: {
    api_key: "54452c59b31e4d14aca213ec76014baa",
    limit: 12,
  },
};

// Update trending giphys
function update() {
  // Toggle refresh state
  $("#update .icon").toggleClass("d-none");

  // Call Giphy API
  $.get(giphy.url, giphy.query)

    // Success
    .done(function (res) {
      const latestGiphys = [];
      // Empty Element
      $("#giphys").empty();

      // Loop Giphys
      $.each(res.data, function (i, giphy) {
        // Add Giphy HTML

        latestGiphys.push(giphy.images.downsized_large.url);

        $("#giphys").prepend(
          '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
            '<img class="w-100 img-fluid" src="' +
            giphy.images.downsized_large.url +
            '">' +
            "</div>"
        );
      });

      giphyCacheClean(latestGiphys);
    })

    // Failure
    .fail(function () {
      $(".alert").slideDown();
      setTimeout(function () {
        $(".alert").slideUp();
      }, 2000);
    })

    // Complete
    .always(function () {
      // Re-Toggle refresh state
      $("#update .icon").toggleClass("d-none");
    });

  // Prevent submission if originates from click
  return false;
}

// Manual refresh
$("#update a").click(update);

// Update trending giphys on load
update();
