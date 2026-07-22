$(function () {
  const listingId = $('#listing-page').data('listing-id');
  const loggedIn = Boolean($('#listing-page').data('logged-in'));

  function renderReview(r) {
    return (
      '<div class="review">' +
        '<div class="rating-stars">' + starString(r.rating) + '</div>' +
        '<div>' + escapeHtml(r.comment || '') + '</div>' +
        '<div class="card-meta">— ' + escapeHtml(r.user_name) + '</div>' +
      '</div>'
    );
  }

  function reviewFormHtml() {
    if (!loggedIn) {
      return '<p class="card-meta"><a href="/login">Log in</a> to leave a review.</p>';
    }
    return (
      '<div class="form-card" style="margin-top:1.5rem;">' +
        '<h3>Leave a review</h3>' +
        '<form id="review-form">' +
          '<div class="field"><label for="rating">Rating (1-5)</label><input type="number" id="rating" name="rating" min="1" max="5" required /></div>' +
          '<div class="field"><label for="comment">Comment</label><textarea id="comment" name="comment" rows="3"></textarea></div>' +
          '<div class="form-error" id="review-error"></div>' +
          '<button type="submit" class="btn-pill">Submit review</button>' +
        '</form>' +
      '</div>'
    );
  }

  function render(data) {
    const l = data.listing;
    const images = (l.images || []).length ? l.images : ['/img/placeholder.svg'];
    const amenities = (l.amenities || []).map((a) => '<span class="chip">' + escapeHtml(a) + '</span>').join('');
    const colleges = (l.colleges || []).map((c) => '<span class="chip">' + escapeHtml(c.name) + '</span>').join('');
    const rating = l.avg_rating ? starString(l.avg_rating) + ' (' + l.avg_rating + ' avg)' : 'No reviews yet';

    let html = '';
    html += '<div class="gallery">' + images.map((src) => '<img src="' + escapeHtml(src) + '" alt="" />').join('') + '</div>';
    html += '<h1>' + escapeHtml(l.title) + '</h1>';
    html += '<p class="card-meta">' + escapeHtml(l.address) + '</p>';
    html += '<p class="rating-stars">' + rating + '</p>';
    html += '<p class="card-rent">₹' + l.rent + '/mo · Deposit ₹' + l.deposit + '</p>';
    html += '<div class="chip-row">' + amenities + '</div>';
    html += '<h3>Near</h3><div class="chip-row">' + (colleges || '<p>Not linked to a college yet.</p>') + '</div>';
    html += '<p>' + escapeHtml(l.description || '') + '</p>';
    html += '<p class="card-meta">Listed by ' + escapeHtml(l.owner_name) + (l.owner_phone ? ' · ' + escapeHtml(l.owner_phone) : '') + '</p>';
    html += '<h3>Reviews</h3><div id="reviews-list">' + (data.reviews.length ? data.reviews.map(renderReview).join('') : '<p>No reviews yet.</p>') + '</div>';
    html += reviewFormHtml();

    $('#listing-content').html(html);

    $('#review-form').on('submit', function (e) {
      e.preventDefault();
      $('#review-error').text('');
      apiRequest({
        url: '/api/v1/listings/' + listingId + '/reviews',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ rating: Number($('#rating').val()), comment: $('#comment').val() }),
      }).done(function () {
        load();
      }).fail(function (xhr) {
        $('#review-error').text(xhr.friendlyMessage);
      });
    });
  }

  function load() {
    apiRequest({ url: '/api/v1/listings/' + listingId, method: 'GET' })
      .done(render)
      .fail(function (xhr) {
        $('#listing-content').html('<div class="empty-state">' + escapeHtml(xhr.friendlyMessage) + '</div>');
      });
  }

  load();
});
