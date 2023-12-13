console.log('check');
const linkedReply = document.querySelector('#linkedReply').value;
const rereplyBtn = document.querySelector('#rereply_btn');
const rereplyList = document.querySelector('.rereply_list');
const rereplyWrap = document.querySelector('#rereply_wrap');
const rereplyDelBtn = document.querySelectorAll('.rereply_del_btn');
const rereplyEditBtn = document.querySelectorAll('.rereply_edit_btn');

const reresetBtn = () => {
  const rereplyDelBtn = document.querySelectorAll('.rereply_del_btn');
  rereplyDelBtn.forEach((v) => {
    v.addEventListener('click', deleteRereply);
  });
  const rereplyEditBtn = document.querySelectorAll('.rereply_edit_btn');
  rereplyEditBtn.forEach((v) => {
    v.addEventListener('click', editRereply);
  });
};

const createRereply = async () => {
  const rereplyContent = document.querySelector('#rereply_content');
  if (rereplyContent.value === '') {
    alert('댓글내용을 입력해 주세요.');
    return;
  }

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ linkedReply, rereplyContent: rereplyContent.value }),
  };

  const response = await fetch('/rereply/create', option);
  const data = await response.text();

  rereplyList.innerHTML = data;
  rereplyContent.value = '';

  reresetBtn();
};

const readMoreRereply = async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (justCounting) {
      justCounting = false;
      scrollCounter += 1;
      const url = `/rereply/read?page=${scrollCounter}&index=${linkedPosting}`;

      const response = await fetch(url);
      const data = await response.text();
      if (data === 'false') {
        return;
      }

      const loadedRereply = document.createElement('ul');
      loadedRereply.classList.add('rereply_list');
      loadedRereply.innerHTML = data;

      replyWrap.appendChild(loadedRereply);

      reresetBtn();

      setTimeout(() => {
        justCounting = true;
      }, 1000);
    }
  }
};

const deleteRereply = async (e) => {
  if (isEditing) isEditing = false;

  const rereplyId = e.target.querySelector('input').value;
  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ rereplyId, linkedReply }),
  };

  const response = await fetch(`/rereply/del?rereply=${rereplyId}`, option);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다.');

  if (data === 'error2') {
    return alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
  }
  
  alert('댓글이 삭제되었습니다.');

  e.target.parentNode.remove();

  reresetBtn();
};

const renewEditBtnClick = async (e) => {
  isEditing = false;
  const editContent = document.querySelector('.rereply_edit_content').value;
  const rereplyId = e.target.querySelector('input').value;

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ rereplyId, editContent, linkedReply }),
  };

  const response = await fetch('/rereply/edit', option);
  const data = await response.text();

  alert('댓글을 수정했습니다.');
  e.target.parentNode.innerHTML = data;

  reresetBtn();
};

const editRereply = async (e) => {
  if (isEditing === true) return alert('이미 변경중인 댓글이 있습니다.');
  const rereplyId = e.target.querySelector('input').value;

  const response = await fetch(`/rereply/edit?rereply=${rereplyId}`);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다.');

  if (data === 'error2')
    return alert('본인이 작성한 댓글만 수정할 수 있습니다.');

  isEditing = true;
  const contentDiv = e.target.parentNode.querySelector('div');
  const content = contentDiv.textContent;

  const editInput = document.createElement('textarea');
  editInput.classList.add('rereply_edit_content');
  editInput.value = content;
  contentDiv.textContent = '';
  contentDiv.appendChild(editInput);

  const newEditBtn = document.createElement('span');
  newEditBtn.innerHTML = '수정하기';
  newEditBtn.classList.add('new_edit_btn');
  e.target.parentNode.appendChild(newEditBtn);

  const sendInput = document.createElement('input');
  sendInput.value = rereplyId;
  sendInput.style.display = 'none';
  newEditBtn.appendChild(sendInput);

  e.target.remove();
  console.log(e.target.nextSibling);

  newEditBtn.addEventListener('click', renewEditBtnClick);
};

rereplyBtn.addEventListener('click', createRereply);

document.addEventListener('scroll', readMoreRereply);

rereplyDelBtn.forEach((v) => {
  v.addEventListener('click', deleteRereply);
});

rereplyEditBtn.forEach((v) => {
  v.addEventListener('click', editRereply);
});
