export default {
  height: 200,
  menubar: false,
  statusbar: false,
  plugins: [
    'textpattern advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table contextmenu paste code'
  ],
  content_css: [
    '//fonts.googleapis.com/css?family=Roboto:300,300i,400,400i',
    // '//www.mucholab.net/css/tinymce.css'
  ],
  textpattern_patterns: [
    { start: '*', end: '*', format: 'italic' },
    { start: '**', end: '**', format: 'bold' },
    { start: '#', format: 'h1' },
    { start: '##', format: 'h2' },
    { start: '###', format: 'h3' },
    { start: '####', format: 'h4' },
    { start: '#####', format: 'h5' },
    { start: '######', format: 'h6' },
    { start: '1. ', cmd: 'InsertOrderedList' },
    { start: '* ', cmd: 'InsertUnorderedList' },
    { start: '- ', cmd: 'InsertUnorderedList' }
  ],
  valid_elements: '*[*]',
  toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image code',
  // setup: (editor) => {
  //   editor.on('change', (e) => {
  //     this.detail = editor.getContent();
  //   });
  // }
}
