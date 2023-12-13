console.log('check');
const linkedPosting = document.querySelector('#linkedPosting').value;
const replyBtn = document.querySelector('#reply_btn');
const replyList = document.querySelector('.reply_list');
const replyWrap = document.querySelector('#reply_wrap');
const replyDelBtn = document.querySelectorAll('.reply_del_btn');
const replyEditBtn = document.querySelectorAll('.reply_edit_btn');

let scrollCounter = 0;
let justCounting = true;
let isEditing = false;

const resetBtn = () => {
  const replyDelBtn = document.querySelectorAll('.reply_del_btn');
  replyDelBtn.forEach((v) => {
    v.addEventListener('click', deleteReply);
  });
  const replyEditBtn = document.querySelectorAll('.reply_edit_btn');
  replyEditBtn.forEach((v) => {
    v.addEventListener('click', editReply);
  });
};

const createReply = async () => {
  const replyContent = document.querySelector('#reply_content');
  if (replyContent.value === '') {
    alert('댓글내용을 입력해 주세요.');
    return;
  }

  if (replyContent.value.length > 120) {                   // 댓글창에 120자 넘어가면 타이핑 못하게 해놓긴 했는데 그래도 그냥,, 다시 한번 알림 해놓음 히히
    alert('댓글은 120자 이내로 입력해 주세요.');
    return;
  }                                

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ linkedPosting, replyContent: replyContent.value }),
  };

  const response = await fetch('/reply/create', option);
  const data = await response.text();

  replyList.innerHTML = data;
  replyContent.value = '';
  const newReplyCnt = document.querySelector('.reply_cnt_fr_srv').value;
  const replyCnt = document.querySelector('#reply_count');
  replyCnt.innerHTML = `${newReplyCnt}개`;

  resetBtn();
};

const readMoreReply = async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (justCounting) {
      justCounting = false;
      scrollCounter += 1;
      const url = `/reply/read?page=${scrollCounter}&index=${linkedPosting}`;

      const response = await fetch(url);
      const data = await response.text();
      if (data === 'false') {
        return;
      }

      const loadedReply = document.createElement('ul');
      loadedReply.classList.add('reply_list');
      loadedReply.innerHTML = data;

      replyWrap.appendChild(loadedReply);

      resetBtn();

      setTimeout(() => {
        justCounting = true;
      }, 1000);
    }
  }
};

const deleteReply = async (e) => {
  if (isEditing) isEditing = false;

  const replyId = e.target.querySelector('input').value;
  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ replyId, linkedPosting }),
  };

  const response = await fetch(`/reply/del?reply=${replyId}`, option);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다.');

  if (data === 'error2') {
    return alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
  }
  
  alert('댓글이 삭제되었습니다.');

  e.target.parentNode.remove();
  const replyCnt = document.querySelector('#reply_count');
  const cntNum = replyCnt.textContent.split('개')[0];
  replyCnt.innerHTML = `${cntNum - 1}개`;
  resetBtn();
};

const newEditBtnClick = async (e) => {
  isEditing = false;
  const editContent = document.querySelector('.reply_edit_content').value;
  const replyId = e.target.querySelector('input').value;

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ replyId, editContent, linkedPosting }),
  };

  const response = await fetch('/reply/edit', option);
  const data = await response.text();

  alert('댓글을 수정했습니다.');
  e.target.parentNode.innerHTML = data;

  resetBtn();
};

const editReply = async (e) => {
  if (isEditing === true) return alert('이미 변경중인 댓글이 있습니다.');
  const replyId = e.target.querySelector('input').value;

  const response = await fetch(`/reply/edit?reply=${replyId}`);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다.');

  if (data === 'error2')
    return alert('본인이 작성한 댓글만 수정할 수 있습니다.');

  isEditing = true;
  const contentDiv = e.target.parentNode.querySelector('div');
  const content = contentDiv.textContent;

  const editInput = document.createElement('textarea');
  editInput.classList.add('reply_edit_content');
  editInput.value = content;
  contentDiv.textContent = '';
  contentDiv.appendChild(editInput);

  const newEditBtn = document.createElement('span');
  newEditBtn.innerHTML = '수정하기';
  newEditBtn.classList.add('new_edit_btn');
  e.target.parentNode.appendChild(newEditBtn);

  const sendInput = document.createElement('input');
  sendInput.value = replyId;
  sendInput.style.display = 'none';
  newEditBtn.appendChild(sendInput);

  e.target.remove();
  console.log(e.target.nextSibling);

  newEditBtn.addEventListener('click', newEditBtnClick);
};

replyBtn.addEventListener('click', createReply);

document.addEventListener('scroll', readMoreReply);

replyDelBtn.forEach((v) => {
  v.addEventListener('click', deleteReply);
});

replyEditBtn.forEach((v) => {
  v.addEventListener('click', editReply);
});
