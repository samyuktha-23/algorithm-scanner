document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const searchInput = document.getElementById('searchTerm');
  const caseCheckbox = document.getElementById('caseSensitive');
  const downloadBtn = document.getElementById('downloadBtn');
  const output = document.getElementById('output');
  const lineNumbers = document.getElementById('lineNumbers');
  const complexityBox = document.getElementById('complexity');

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const rawText = e.target.result;
        const lines = rawText.split('\n');
        const highlighted = highlightKeywords(rawText);
        output.innerHTML = addCollapsibleBlocks(highlighted);
        lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
        estimateComplexity(rawText);
      };
      reader.readAsText(file);
    }
  });

  searchInput.addEventListener('input', function () {
    const term = this.value.trim();
    const caseSensitive = caseCheckbox.checked;
    if (!term) {
      output.innerHTML = output.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
      return;
    }
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${term})`, flags);
    output.innerHTML = output.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
    output.innerHTML = output.innerHTML.replace(regex, '<span class="highlight">$1</span>');
  });

  downloadBtn.addEventListener('click', function () {
    const element = document.querySelector('.container');
    const opt = {
      margin: 0.5,
      filename: 'algorithm_scan.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    document.body.classList.add('pdf-mode');
    html2pdf().set(opt).from(element).save().then(() => {
      document.body.classList.remove('pdf-mode');
    });
  });

  function highlightKeywords(text) {
    const keywords = ['def', 'return', 'if', 'else', 'for', 'while', 'import', 'class'];
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    return text.replace(regex, '<span class="keyword">$1</span>');
  }

  function addCollapsibleBlocks(text) {
    return text.replace(/<span class="keyword">def<\/span> (.+?)\((.*?)\):([\s\S]*?)(?=<span class="keyword">def<\/span>|$)/g, (match, name, args, body) => {
      return `<details><summary><span class="keyword">def</span> ${name}(${args})</summary>${body}</details>`;
    });
  }

  function estimateComplexity(code) {
    const loopCount = (code.match(/\b(for|while)\b/g) || []).length;
    let complexity = 'O(1)';
    if (loopCount === 1) complexity = 'O(n)';
    else if (loopCount === 2) complexity = 'O(n²)';
    else if (loopCount >= 3) complexity = `O(n^${loopCount})`;
    complexityBox.textContent = `Estimated Time Complexity: ${complexity}`;
  }
});

