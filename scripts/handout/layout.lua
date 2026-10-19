-- Style the document's existing title, course details, and metadata without
-- duplicating their text in the template. The Markdown remains authoritative.
function Pandoc(doc)
  local blocks = doc.blocks
  if not (blocks[1] and blocks[1].t == 'Header' and blocks[1].level == 1
      and blocks[2] and blocks[2].t == 'BlockQuote'
      and blocks[3] and blocks[3].t == 'Para') then
    error('Expected an H1, course blockquote, and metadata paragraph at the top')
  end
  local items, line = {}, {}
  local function add_line()
    if #line > 0 then
      items:insert(pandoc.Div({pandoc.Para(line)}, {class = 'metadata-item'}))
      line = {}
    end
  end
  items = pandoc.List(items)
  for _, inline in ipairs(blocks[3].content) do
    if inline.t == 'SoftBreak' or inline.t == 'LineBreak' then
      add_line()
    else
      table.insert(line, inline)
    end
  end
  add_line()
  local header = pandoc.Div({blocks[1], blocks[2],
    pandoc.Div(items, {class = 'metadata-grid'})}, {class = 'masthead'})
  blocks:remove(1)
  blocks:remove(1)
  blocks:remove(1)
  blocks:insert(1, header)
  return doc
end
