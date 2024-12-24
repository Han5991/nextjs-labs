### next dev 를 치면 어떻게 처리 할까?

- node_modules/next/dist/bin/next 파일을 실행한다.
    -  ```javascript
        program
        .command('dev', { isDefault: true })
        .action(
            (directory: string, options: NextDevOptions, { _optionValueSources }) => {
                const portSource = _optionValueSources.port
                import('../cli/next-dev.js').then((mod) =>
                    mod.nextDev(options, portSource, directory)
                  )
                }
            )
        .usage('[directory] [options]')
       ```
       
       dev를 받으면 거기에 맞는 program.command를 실행한다. 여기서 ../cli/next-dev.js를 import하고 nextDev를 실행한다.
       여기서 알 수 있는 것은 next-dev.js를 실행할 때 portSource와 directory를 넣어준다.
    - **next-dev.js**
      ```javascript
      import { fork } from 'child_process'
      // 시작 할 떄 디렉토리를 가져와 라우팅을 만드는 부분
      let dir = getProjectDir(process.env.NEXT_PRIVATE_DEV_DIR || directory)

      const startServerPath = require.resolve('../server/lib/start-server')
          child = fork(startServerPath, {
           stdio: 'inherit',
           env: {
              ...defaultEnv,
             TURBOPACK: process.env.TURBOPACK,
              NEXT_PRIVATE_WORKER: '1',
             NEXT_PRIVATE_TRACE_ID: traceId,
              NODE_EXTRA_CA_CERTS: startServerOptions.selfSignedCertificate
                ? startServerOptions.selfSignedCertificate.rootCA
                : defaultEnv.NODE_EXTRA_CA_CERTS,
             NODE_OPTIONS: formatNodeOptions(nodeOptions),
             // There is a node.js bug on MacOS which causes closing file watchers to be really slow.
             // This limits the number of watchers to mitigate the issue.
             // https://github.com/nodejs/node/issues/29949
              WATCHPACK_WATCHER_LIMIT:
               os.platform() === 'darwin' ? '20' : undefined,
            },
          })
       ```
        여기서는 path 를 들고와 startServerPath에 넣어준다. 그리고 fork를 통해 startServerPath를 실행한다.
        여기서는 stdio: 'inherit'를 통해 부모 프로세스의 입출력을 자식 프로세스로 전달한다.
        **child_process** -> next js 와 핫리로드를 분리 시킬려고 fork를 사용한다.(추측중)
        > 실행 하기전 여러가지를 검증 한다.
        > 1. 디렉토리를 가져와 라우팅을 만드는 부분
        > 2. 디렉토리가 제대로 있는지 확인 하는 부분
        > 3. 디펜더시에 sass와 node-sass가 중복으로 설치 되어 있는지(워밍)
        > 4. @next/font가 설치 되어 있는지(워밍)
    - **start-server.js**
      ```javascript
        import http from 'http'
        import https from 'https'
      
        const server = selfSignedCertificate
          ? https.createServer(
            {
              key: fs.readFileSync(selfSignedCertificate.key),
              cert: fs.readFileSync(selfSignedCertificate.cert),
            },
            requestListener
          )
          : http.createServer(requestListener)
      ```
      여기서는 http와 https를 import 사용 드디어 여기서 서버가 탄생한다 expree를 사용하지 않고 직접 서버를 만들어서 사용한다.
