/* global describe, it, expect, beforeEach, spyOn */

import Register from '../../client/Register.jsx';
import ReactDOM from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import $ from 'jquery';

describe('the <Register /> component', function() {
    var node, component;
    var router = {
        push: function() {},
        replace: function() {},
        go: function() {},
        goBack: function() {},
        goForward: function() {},
        setRouteLeaveHook: function() {},
        isActive: function() {}
    };

    beforeEach(function() {
        node = document.createElement('div');
        component = ReactDOM.render(<Register router={ router }/>, node).getWrappedInstance();

        spyOn($, 'post').and.callFake(function() {
            var defer = $.Deferred();

            defer.resolve({});

            return defer.promise();
        });
    });

    describe('when initially rendered', function() {
        it('should render a blank form', function() {
            var form = TestUtils.scryRenderedDOMComponentsWithTag(component, 'form');

            expect(form.length).toBe(1);
            expect(component.state.username).toBe('');
            expect(component.state.email).toBe('');
        });
    });

    describe('when an input is changed', function() {
        describe('and the username input is changed', function() {
            it('should set the username in state', function() {
                var input = component.refs.username;

                TestUtils.Simulate.change(input, { target: { value: 'test' } });

                expect(component.state.username).toBe('test');
            });
        });

        describe('and the email input is changed', function() {
            it('should set the email in state', function() {
                var input = component.refs.email;

                TestUtils.Simulate.change(input, { target: { value: 'test@example.com' } });

                expect(component.state.email).toBe('test@example.com');
            });
        });
    });

    describe('when validating', function() {
        describe('username', function() {
            describe('and the username is blank', function() {
                it('should give a validation error', function() {
                    component.state.username = '';

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).not.toBe(undefined);
                });
            });

            describe('and the username is longer than 15 characters', function() {
                it('should give a validation error', function() {
                    component.state.username = '1234567890123456';

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).not.toBe(undefined);
                });
            });

            describe('and the username is shorter than 3 characters', function() {
                it('should give a validation error', function() {
                    component.state.username = '12';

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).not.toBe(undefined);
                });
            });

            describe('and the username has invalid characters', function() {
                it('should give a validation error', function() {
                    component.state.username = 'invalid£username';

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).not.toBe(undefined);
                });
            });

            describe('and the server returns the username is in use', function() {
                it('should give a validation error', function() {
                    component.state.username = 'test';

                    $.post.and.callFake(function() {
                        var defer = $.Deferred();

                        defer.resolve({ message: 'test' });

                        return defer.promise();
                    });

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).not.toBe(undefined);
                });
            });

            describe('and the username is valid', function() {
                it('should not give a validation error', function() {
                    component.state.username = 'testusername';

                    TestUtils.Simulate.blur(component.refs.username);

                    expect(component.state.validation['username']).toBe(undefined);
                });
            });
        });

        describe('email', function() {
            describe('when no email address', function() {
                it('should give a validation error', function() {
                    component.state.email = '';

                    TestUtils.Simulate.blur(component.refs.email);

                    expect(component.state.validation['email']).not.toBe(undefined);
                });
            });

            describe('when not a valid email address', function() {
                it('should give a validation error', function() {
                    component.state.email = 'invalid@email';

                    TestUtils.Simulate.blur(component.refs.email);

                    expect(component.state.validation['email']).not.toBe(undefined);
                });
            });

            describe('when a valid email address', function() {
                it('should not give a validation error', function() {
                    component.state.email = 'valid@email.example.com';

                    TestUtils.Simulate.blur(component.refs.email);

                    expect(component.state.validation['email']).toBe(undefined);
                });
            });
        });

        describe('password', function() {
            describe('when password and repeat password both unspecified', function() {
                it('should give a validation error', function() {
                    component.state.password = '';
                    component.state.password1 = '';

                    TestUtils.Simulate.blur(component.refs.password);

                    expect(component.state.validation['password']).not.toBe(undefined);
                });
            });

            describe('when password is specified but repeat is not and not submitting', function() {
                it('should not give a validation error', function() {
                    component.state.password = 'testing';
                    component.state.password1 = '';

                    TestUtils.Simulate.blur(component.refs.password);

                    expect(component.state.validation['password']).toBe(undefined);
                });
            });

            describe('when password is specified but repeat is not and submitting', function() {
                it('should give a validation error', function() {
                    component.state.password = 'testing';
                    component.state.password1 = '';

                    component.verifyPassword({}, true);

                    expect(component.state.validation['password']).not.toBe(undefined);
                });
            });

            describe('when password is specified and differs from repeat', function() {
                it('should give a validation error', function() {
                    component.state.password = 'test';
                    component.state.password1 = 'different';

                    TestUtils.Simulate.blur(component.refs.password);

                    expect(component.state.validation['password']).not.toBe(undefined);
                });
            });

            describe('when password is too short', function() {
                it('should give a validation error', function() {
                    component.state.password = 'test';
                    component.state.password = 'test';

                    TestUtils.Simulate.blur(component.refs.password);

                    expect(component.state.validation['password']).not.toBe(undefined);
                });
            });

            describe('when password and repeat are specified and match', function() {
                it('should not give a validation error', function() {
                    component.state.password = 'testing';
                    component.state.password1 = 'testing';

                    TestUtils.Simulate.blur(component.refs.password);

                    expect(component.state.validation['password']).toBe(undefined);
                });
            });
        });

        describe('and the validation fails', function() {
            it('should render error classes and the error text', function() {
                component.state.validation['username'] = 'testing';

                component = ReactDOM.render(<Register router={ router } />, node);

                var errorDivs = TestUtils.scryRenderedDOMComponentsWithClass(component, 'has-error');

                expect(errorDivs.length).toBe(1);

                var errorBlock = TestUtils.scryRenderedDOMComponentsWithClass(component, 'help-block');
                expect(errorBlock[0].innerText).toBe('testing');
            });
        });
    });

    describe('on register', function() {
        beforeEach(function() {
            spyOn(component, 'verifyUsername');
            spyOn(component, 'verifyEmail');
            spyOn(component, 'verifyPassword');
        });

        describe('when a field is invalid', function() {
            it('should show an error and not call the server', function() {
                spyOn($, 'ajax');

                component.state.validation['username'] = 'Test error';

                TestUtils.Simulate.click(component.refs.submit);

                expect(component.state.error).not.toBe(undefined);
                expect($.ajax).not.toHaveBeenCalled();
            });
        });

        describe('when the server call fails', function() {
            it('should show an error', function() {
                spyOn($, 'ajax').and.callFake(function() {
                    var defer = $.Deferred();

                    defer.reject({ message: 'test' });

                    return defer.promise();
                });

                TestUtils.Simulate.click(component.refs.submit);

                expect(component.state.error).not.toBe(undefined);
                expect($.ajax).toHaveBeenCalled();
            });
        });

        describe('when the server returns failure', function() {
            it('should show an error', function() {
                spyOn($, 'ajax').and.callFake(function() {
                    var defer = $.Deferred();

                    defer.resolve({ success: false, message: 'test' });

                    return defer.promise();
                });

                TestUtils.Simulate.click(component.refs.submit);

                expect(component.state.error).not.toBe(undefined);
                expect($.ajax).toHaveBeenCalled();
            });
        });

        describe('when the server returns success', function() {
            it('should not show any errors', function() {
                spyOn($, 'ajax').and.callFake(function() {
                    var defer = $.Deferred();

                    defer.resolve({ success: true, message: 'test' });

                    return defer.promise();
                });

                TestUtils.Simulate.click(component.refs.submit);

                expect(component.state.error).toBe('');
                expect($.ajax).toHaveBeenCalled();
            });
        });
    });
});
