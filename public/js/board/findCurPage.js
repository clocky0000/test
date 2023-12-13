const pageList = document.querySelectorAll('.page_num');
const curPage = document.querySelector('#cur_page').innerHTML;

(function findCurPage() {
  const index = curPage % 5 ? (curPage % 5) - 1 : 4;
  pageList[index].classList.add('emphasis');
})();

