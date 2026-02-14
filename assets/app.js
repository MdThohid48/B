document.querySelectorAll('[data-progress]').forEach((bar) => {
  bar.style.width = `${bar.dataset.progress}%`;
});

document.querySelectorAll('[data-otp]').forEach((group) => {
  const inputs = [...group.querySelectorAll('input')];
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && inputs[idx + 1]) inputs[idx + 1].focus();
    });
  });
});
