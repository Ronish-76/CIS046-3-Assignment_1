/**
 * InputController — Unified Keyboard and Numpad Handler
 * Handles hardware keystrokes and on-screen interactive numpads.
 */

class InputController {
  constructor({ inputElement, onSubmit, onClear }) {
    this.inputElement = inputElement;
    this.onSubmit = onSubmit || (() => {});
    this.onClear = onClear || (() => {});
    this.enabled = true;

    this.bindEvents();
  }

  setEnabled(state) {
    this.enabled = Boolean(state);
    if (this.inputElement) {
      this.inputElement.disabled = !this.enabled;
    }
  }

  bindEvents() {
    // Physical keyboard listener
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      // Ignore when focused in a text input elsewhere (e.g. login modal or search)
      if (e.target && e.target !== this.inputElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        this.setValue(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.clear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.triggerSubmit();
      }
    });

    // Touch numpad delegate
    document.addEventListener('click', (e) => {
      if (!this.enabled) return;

      const numpadBtn = e.target.closest('[data-numpad-val]');
      if (numpadBtn) {
        const val = numpadBtn.getAttribute('data-numpad-val');
        if (val === 'clear') {
          this.clear();
        } else if (val === 'enter') {
          this.triggerSubmit();
        } else {
          this.setValue(val);
        }
      }
    });
  }

  setValue(val) {
    if (this.inputElement) {
      this.inputElement.value = val;
      this.inputElement.classList.add('has-value');
    }
  }

  clear() {
    if (this.inputElement) {
      this.inputElement.value = '';
      this.inputElement.classList.remove('has-value');
    }
    this.onClear();
  }

  triggerSubmit() {
    if (this.inputElement && this.inputElement.value !== '') {
      this.onSubmit(this.inputElement.value);
    }
  }

  getValue() {
    return this.inputElement ? this.inputElement.value : '';
  }
}

window.InputController = InputController;

