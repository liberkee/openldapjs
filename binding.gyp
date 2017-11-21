{
  'targets': [
    {
      'target_name': 'binding',
      'conditions': [
        ['OS=="win"',
          {
            'include_dirs' : [
              "<!(node -e \"require('nan')\")",
              './bin/inc'
            ],
            'link_settings': {
              'libraries': [
                'LIBLDAP_R.lib',
                'LDAP_SSL.lib',
                'LIBLBER.lib',
              ],
              'library_dirs': [
                './bin/dll',
                './bin/lib'
              ],
            },
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
      'defines': [ 'V8_DEPRECATION_WARNINGS=1', 
        'LDAP_DEPRECATED' 
      ],
      'sources': [ './src/binding.cc', './src/ldap_control.cc','./src/ldap_bind_progress.cc', './src/ldap_paged_search_progress.cc',
        './src/ldap_search_progress.cc','./src/ldap_add_progress.cc','./src/ldap_delete_progress.cc',
        './src/ldap_modify_progress.cc','./src/ldap_rename_progress.cc','./src/ldap_compare_progress.cc',
        './src/ldap_changePassword_progress.cc', './src/ldap_map_result.cc', './src/ldap_helper_function.cc'
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
