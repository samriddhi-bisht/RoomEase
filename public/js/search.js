$(function () {
  function renderListing(l) {
    const img = l.cover_image || '/img/placeholder.svg';
    const rating = l.avg_rating ? starString(l.avg_rating) + ' (' + l.avg_rating + ')' : 'No reviews yet';
    return (
      '<a class="card" href="/listings/' + l.id + '">' +
        '<img class="card-img" src="' + escapeHtml(img) + '" alt="" />' +
        '<div class="card-body">' +
          '<div class="card-title">' + escapeHtml(l.title) + '</div>' +
          '<div class="card-meta">' + escapeHtml(l.address) + '</div>' +
          '<div class="card-meta">' + rating + '</div>' +
          '<div class="card-footer">' +
            '<span class="card-rent">₹' + l.rent + '/mo</span>' +
            '<span class="chip">' + escapeHtml(l.gender_preference) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function loadResults() {
    const params = $('#filter-form').serialize();
    $('#results').html('<p>Loading…</p>');
    apiRequest({ url: '/api/v1/search?' + params, method: 'GET' })
      .done(function (res) {
        if (!res.listings.length) {
          $('#results').html('<div class="empty-state">No listings match those filters yet.</div>');
          return;
        }
        $('#results').html(res.listings.map(renderListing).join(''));
      })
      .fail(function (xhr) {
        $('#results').html('<div class="empty-state">' + escapeHtml(xhr.friendlyMessage) + '</div>');
      });
  }

  $('#filter-form').on('submit', function (e) {
    e.preventDefault();
    loadResults();
  });

  loadResults();
});
