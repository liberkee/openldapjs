{
  'targets': [
    {
      'target_name': 'binding',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],
      'include_dirs' : [
         "<!(node -e \"require('nan')\")",
        '/usr/local/include'
      ],
      'sources': [ './src/binding.cc', './src/ldap_control.cc','./src/ldap_bind_progress.cc', './src/ldap_paged_search_progress.cc',
            './src/ldap_search_progress.cc','./src/ldap_add_progress.cc','./src/ldap_delete_progress.cc',
            './src/ldap_modify_progress.cc','./src/ldap_rename_progress.cc','./src/ldap_compare_progress.cc',
            './src/ldap_changePassword_progress.cc', './src/ldap_map_result.cc', './src/ldap_helper_function.cc'],
      'ldflags': [
            '-Wl,-z,defs'
      ],
      'libraries': [
         '-lldap',
         '-llber'
      ],
      'defines': [
          'LDAP_DEPRECATED'
      ],
      'ldflags': [
          '-L/usr/local/lib'
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
