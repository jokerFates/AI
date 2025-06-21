/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs')
const { console } = require('inspector')
const path = require('path')

const runQuestion = [
  {
    type: 'list',
    name: 'mode',
    message: '运行方式',
    choices: [
      { name: '开发调试', value: 'dev' },
      { name: '打包上线', value: 'build' },
      { name: '依赖分析', value: 'analyzer' }
    ]
  },
  {
    type: 'list',
    name: 'runEnv',
    message: '运行环境',
    choices: [
      { name: '测试', value: 'test' },
      { name: '预发', value: 'pre' },
      { name: '正式', value: 'pro' }
    ]
  },
  {
    type: 'input',
    name: 'port',
    message: '请输入端口',
    default: 8081
  },
]

const createQuestion = [
  {
    type: 'text',
    name: 'name',
    message: '请输入项目名称：',
    validate(name) {
      if (!name.trim()) {
        return '项目名字不能为空'
      }
      const entryDir = path.join(process.cwd(), '/src/projects')
      const isExist = fs.readdirSync(entryDir).includes(name)
      if (isExist) {
        return '项目名字已经存在'
      }
      return true
    }
  }, {
    type: 'text',
    name: 'title',
    message: '可作为网页的title：',
  }
]

module.exports = { runQuestion, createQuestion }
