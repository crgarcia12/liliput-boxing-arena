export default {
  default: {
    require: ['tests/step_definitions/**/*.cjs'],
    paths: ['tests/features/**/*.feature'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' }
  }
}
