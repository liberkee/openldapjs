{
  'targets': [
    {
      'target_name': 'binding',
      'conditions': [
        ['OS=="win"',
          {
            'include_dirs' : [
              "<!(node -e \"require('nan')\")",
              './bin/include'
            ],
            'link_settings': {
              'libraries': [
                'LIBLDAP_R.lib',
                'LIBLBER.lib',
              ],
              'library_dirs': [
                './bin/lib'
              ],
            },
            'copies':[
              {
                'destination':'<(module_root_dir)/lib/binding/Release/node-v57-win32-x64',
                'files':['<(module_root_dir)/bin/dll/libeay32.dll','<(module_root_dir)/bin/dll/liblber.dll','<(module_root_dir)/bin/dll/libldap_r.dll','<(module_root_dir)/bin/dll/ssleay32.dll']
              }
            ]
          }
        ], 
        ['OS=="linux"',
          {
            'include_dirs' : [
              "<!(node -e \"require('nan')\")",
              '/usr/local/include'
            ],
            'ldflags': [
              '-Wl,-z,defs'
            ],
            'libraries': [
              '-lldap_r',
              '-llber'
            ],
            'ldflags': [
              '-L/usr/local/lib'
            ],
          }
        ]
      ],
      'product_dir': '<(module_path)',        
      'defines': [ 'V8_DEPRECATION_WARNINGS=1', 
        'LDAP_DEPRECATED' 
      ],
      'sources': [ './src/binding.cc', './src/ldap_control.cc','./src/ldap_bind_progress.cc', './src/ldap_paged_search_progress.cc',
        './src/ldap_search_progress.cc','./src/ldap_add_progress.cc','./src/ldap_delete_progress.cc',
        './src/ldap_modify_progress.cc','./src/ldap_rename_progress.cc','./src/ldap_compare_progress.cc',
        './src/ldap_changePassword_progress.cc', './src/ldap_map_result.cc', './src/ldap_helper_function.cc',
        './src/ldap_extended_operation.cc'
      ],
      'cflags': [
        '-Wall',
        '-g',
        '-std=c++11',
        '-Werror',
        '-Wfatal-errors'
      ],
      'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions']
    }
  ]
}
