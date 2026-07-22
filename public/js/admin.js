$(function () {
  function badgeClass(status) { return 'badge badge-' + status; }

  function renderKycRow(d) {
    return (
      '<tr>' +
        '<td>' + escapeHtml(d.user_name) + '<br/><span class="card-meta">' + escapeHtml(d.user_email) + '</span></td>' +
        '<td>' + escapeHtml(d.doc_type) + (d.doc_number ? ' — ' + escapeHtml(d.doc_number) : '') + '</td>' +
        '<td><a href="' + d.file_path + '" target="_blank" rel="noopener">View file</a></td>' +
        '<td>' + escapeHtml(d.ocr_extracted_name || '—') + '</td>' +
        '<td>' + escapeHtml(d.ocr_extracted_dob || '—') + '</td>' +
        '<td>' +
          '<button class="btn-pill small approve-kyc" data-id="' + d.id + '">Approve</button> ' +
          '<button class="btn-pill small outline reject-kyc" data-id="' + d.id + '">Reject</button>' +
        '</td>' +
      '</tr>'
    );
  }

  function loadKyc() {
    apiRequest({ url: '/api/v1/kyc/pending', method: 'GET' }).done(function (res) {
      if (!res.documents.length) {
        $('#kyc-pending').html('<div class="empty-state">Nothing pending.</div>');
        return;
      }
      $('#kyc-pending').html(
        '<div style="overflow-x:auto;"><table class="data-table"><thead><tr>' +
        '<th>User</th><th>Document</th><th>File</th><th>OCR name match</th><th>OCR DOB</th><th>Action</th>' +
        '</tr></thead><tbody>' + res.documents.map(renderKycRow).join('') + '</tbody></table></div>'
      );
      $('.approve-kyc').on('click', function () { review($(this).data('id'), 'verified'); });
      $('.reject-kyc').on('click', function () {
        const reason = prompt('Rejection reason (optional):') || '';
        review($(this).data('id'), 'rejected', reason);
      });
    });
  }

  function review(id, decision, rejectionReason) {
    apiRequest({
      url: '/api/v1/kyc/' + id + '/review',
      method: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify({ decision, rejectionReason: rejectionReason || undefined }),
    }).done(loadKyc).fail(function (xhr) { alert(xhr.friendlyMessage); });
  }

  function renderListingRow(l) {
    return (
      '<tr>' +
        '<td>' + escapeHtml(l.title) + '</td>' +
        '<td>' + escapeHtml(l.owner_name) + '<br/><span class="card-meta">' + escapeHtml(l.owner_email) + '</span></td>' +
        '<td>₹' + l.rent + '</td>' +
        '<td><span class="' + badgeClass(l.status) + '">' + l.status + '</span></td>' +
        '<td><button class="btn-pill small toggle-listing" data-id="' + l.id + '" data-current="' + l.status + '">' +
          (l.status === 'active' ? 'Deactivate' : 'Activate') + '</button></td>' +
      '</tr>'
    );
  }

  function loadListings() {
    apiRequest({ url: '/api/v1/admin/listings', method: 'GET' }).done(function (res) {
      $('#listings-table').html(
        '<div style="overflow-x:auto;"><table class="data-table"><thead><tr><th>Title</th><th>Owner</th><th>Rent</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
        res.listings.map(renderListingRow).join('') + '</tbody></table></div>'
      );
      $('.toggle-listing').on('click', function () {
        const id = $(this).data('id');
        const next = $(this).data('current') === 'active' ? 'inactive' : 'active';
        apiRequest({
          url: '/api/v1/admin/listings/' + id + '/moderate',
          method: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ status: next }),
        }).done(loadListings);
      });
    });
  }

  loadKyc();
  loadListings();
});
