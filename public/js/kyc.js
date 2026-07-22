$(function () {
  function badgeClass(status) { return 'badge badge-' + status; }

  function renderDoc(d) {
    return (
      '<div class="review">' +
        '<div><span class="' + badgeClass(d.status) + '">' + d.status + '</span> — ' + escapeHtml(d.doc_type) + '</div>' +
        (d.rejection_reason ? '<div class="card-meta">Reason: ' + escapeHtml(d.rejection_reason) + '</div>' : '') +
        '<div class="card-meta">Submitted ' + new Date(d.created_at).toLocaleDateString() + '</div>' +
      '</div>'
    );
  }

  function loadHistory() {
    apiRequest({ url: '/api/v1/kyc/me', method: 'GET' }).done(function (res) {
      $('#kyc-history').html(res.documents.length ? res.documents.map(renderDoc).join('') : '<p>No submissions yet.</p>');
    });
  }

  $('#kyc-form').on('submit', function (e) {
    e.preventDefault();
    $('#kyc-error').text('');
    $('#kyc-success').text('');
    const formData = new FormData(this);
    $.ajax({ url: '/api/v1/kyc', method: 'POST', data: formData, processData: false, contentType: false })
      .done(function (res) {
        let msg = 'Submitted — status: ' + res.document.status + '.';
        if (res.flags && res.flags.length) msg += ' Flags: ' + res.flags.join('; ');
        $('#kyc-success').text(msg);
        $('#kyc-form')[0].reset();
        loadHistory();
      })
      .fail(function (xhr) {
        $('#kyc-error').text((xhr.responseJSON && xhr.responseJSON.error) || 'Could not submit document.');
      });
  });

  loadHistory();
});
