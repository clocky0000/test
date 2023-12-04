const inputList = document.querySelectorAll('input');

const userpw = document.querySelector('#userpw');
const userpwCheck = document.querySelector('#userpw_check');
const pwSpan = document.querySelector('#pw_span');
const pwChkSpan = document.querySelector('#pw_chk_span');

const userNickname = document.querySelector('#usernickname');
const nicknameSpan = document.querySelector('#nickname_span');

const joinBtn = document.querySelector('#btn_container');

let nicknamePass = true;
let pwPass = false;

const btnActive = () => {
  if (
    nicknamePass &&
    pwPass
  ) {
    console.log('check');
    joinBtn.innerHTML = ` <button type="submit" class="join_btn" id="join_submit_btn">
                정보수정
              </button>
              <a class="join_btn non_btn" id="quit_btn" href="/user/quit">
                회원탈퇴
              </a>`;
  } else {
    joinBtn.innerHTML = ` <div class="join_btn non_btn" id="join_submit_btn">
                양식이 지켜지지 않았습니다.
              </div><a class="join_btn non_btn" id="quit_btn" href="/user/quit">
                회원탈퇴
              </a>`;
  }
};

inputList.forEach((v) => {
  v.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
      alert('공백은 입력이 불가능합니다.');
    }
  });
});

userNickname.addEventListener('blur', () => {
  if (userNickname.value === '') {
    userNickname.style.background = 'pink';
    nicknameSpan.innerHTML = '닉네임을 입력해주세요.';
    nicknamePass = false;
  } else {
    userNickname.style.background = '';
    nicknameSpan.innerHTML = '';
    nicknamePass = true;
  }
  btnActive();
});

userpw.addEventListener('blur', () => {
  if (userpw.value === '') {
    userpw.style.background = 'pink';
    pwSpan.innerHTML = '비밀번호를 입력해주세요.';
    pwPass = false;
    btnActive();
    return;
  }

  if (userpw.value !== userpwCheck.value) {
    userpw.style.background = 'pink';
    userpwCheck.style.background = 'pink';
    pwChkSpan.innerHTML = '비밀번호가 일치하지 않습니다.';
    pwPass = false;
    btnActive();
    return;
  }

  userpw.style.background = '';
  pwSpan.innerHTML = '';
  pwPass = true;
  btnActive();
});

userpwCheck.addEventListener('blur', () => {
  if (userpw.value !== userpwCheck.value) {
    userpw.style.background = 'pink';
    userpwCheck.style.background = 'pink';
    pwChkSpan.innerHTML = '비밀번호가 일치하지 않습니다.';
    pwPass = false;
  } else {
    userpw.style.background = '';
    userpwCheck.style.background = '';
    pwChkSpan.innerHTML = '';
    pwPass = true;
  }
  btnActive();
});