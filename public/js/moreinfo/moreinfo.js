console.log('check');
const linkedPosting = document.querySelector('#linkedPosting').value;
const moreinfoBtn = document.querySelector('#moreinfo_btn');
const moreinfoList = document.querySelector('.moreinfo_list');
const moreinfoWrap = document.querySelector('#moreinfo_wrap');
const moreinfoDelBtn = document.querySelectorAll('.moreinfo_del_btn');
const moreinfoEditBtn = document.querySelectorAll('.moreinfo_edit_btn');

let scrollCounter = 0;
let justCounting = true;
let isEditing = false;

const resetBtn = () => {
  const moreinfoDelBtn = document.querySelectorAll('.moreinfo_del_btn');
  moreinfoDelBtn.forEach((v) => {
    v.addEventListener('click', deleteMoreinfo);
  });
  const moreinfoEditBtn = document.querySelectorAll('.moreinfo_edit_btn');
  moreinfoEditBtn.forEach((v) => {
    v.addEventListener('click', editMoreinfo);
  });
};

const createMoreinfo = async () => {
  const moreinfoContent = document.querySelector('#moreinfo_content');
  if (moreinfoContent.value === '') {
    alert('추가할 정보를 입력해 주세요.');
    return;
  }

  if (moreinfoContent.value.length > 120) {                  
    alert('정보는 120자 이내로 입력해 주세요.');
    return;
  }                                

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ linkedPosting, moreinfoContent: moreinfoContent.value }),
  };

  const response = await fetch('/moreinfo/create', option);
  const data = await response.text();

  moreinfoList.innerHTML = data;
  moreinfoContent.value = '';
  const newmoreinfoCnt = document.querySelector('.moreinfo_cnt_fr_srv').value;
  const moreinfoCnt = document.querySelector('#moreinfo_count');
  moreinfoCnt.innerHTML = `${newmoreinfoCnt}개`;

  resetBtn();
};

const readMoreMoreinfo = async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (justCounting) {
      justCounting = false;
      scrollCounter += 1;
      const url = `/moreinfo/read?page=${scrollCounter}&index=${linkedPosting}`;

      const response = await fetch(url);
      const data = await response.text();
      if (data === 'false') {
        return;
      }

      const loadedMoreinfo = document.createElement('ul');
      loadedMoreinfo.classList.add('moreinfo_list');
      loadedMoreinfo.innerHTML = data;

      moreinfoWrap.appendChild(loadedMoreinfo);

      resetBtn();

      setTimeout(() => {
        justCounting = true;
      }, 1000);
    }
  }
};

const deleteMoreinfo = async (e) => {
  if (isEditing) isEditing = false;

  const moreinfoId = e.target.querySelector('input').value;
  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ moreinfoId, linkedPosting }),
  };

  const response = await fetch(`/moreinfo/del?moreinfo=${moreinfoId}`, option);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다');

  if (data === 'error2') {
    return alert('작성자만 삭제 가능합니다');
  }
  
  alert('정보가 삭제되었습니다.');

  e.target.parentNode.remove();
  const moreinfoCnt = document.querySelector('#moreinfo_count');
  const cntNum = moreinfoCnt.textContent.split('개')[0];
  moreinfoCnt.innerHTML = `${cntNum - 1}개`;
  resetBtn();
};

const newEditBtnClick = async (e) => {
  isEditing = false;
  const editContent = document.querySelector('.moreinfo_edit_content').value;
  const moreinfoId = e.target.querySelector('input').value;

  const option = {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ moreinfoId, editContent, linkedPosting }),
  };

  const response = await fetch('/moreinfo/edit', option);
  const data = await response.text();

  alert('정보를 수정했습니다.');
  e.target.parentNode.innerHTML = data;

  resetBtn();
};

const editMoreinfo = async (e) => {
  if (isEditing === true) return alert('이미 변경중인 댓글이 있습니다.');
  const moreinfoId = e.target.querySelector('input').value;

  const response = await fetch(`/moreinfo/edit?moreinfo=${moreinfoId}`);
  const data = await response.text();

  if (data === 'error1') return alert('로그인 후 이용 가능합니다.');

  if (data === 'error2')
    return alert('본인이 작성한 댓글만 수정할 수 있습니다.');

  isEditing = true;
  const contentDiv = e.target.parentNode.querySelector('div');
  const content = contentDiv.textContent;

  const editInput = document.createElement('textarea');
  editInput.classList.add('moreinfo_edit_content');
  editInput.value = content;
  contentDiv.textContent = '';
  contentDiv.appendChild(editInput);

  const newEditBtn = document.createElement('span');
  newEditBtn.innerHTML = '수정하기';
  newEditBtn.classList.add('new_edit_btn');
  e.target.parentNode.appendChild(newEditBtn);

  const sendInput = document.createElement('input');
  sendInput.value = moreinfoId;
  sendInput.style.display = 'none';
  newEditBtn.appendChild(sendInput);

  e.target.remove();
  console.log(e.target.nextSibling);

  newEditBtn.addEventListener('click', newEditBtnClick);
};

moreinfoBtn.addEventListener('click', createMoreinfo);

document.addEventListener('scroll', readMoreMoreinfo);

moreinfoDelBtn.forEach((v) => {
  v.addEventListener('click', deleteMoreinfo);
});

moreinfoEditBtn.forEach((v) => {
  v.addEventListener('click', editMoreinfo);
});
