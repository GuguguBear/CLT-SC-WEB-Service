#!/bin/bash

# =============================================================================
# Star Citizen 聊天服务管理脚本
# 适用于 Windows 11 Git Bash
# =============================================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 服务配置
CHAT_SERVER_PORT=3000
FRONTEND_SERVER_PORT=8000
CHAT_SERVER_SCRIPT="server.js"
PID_DIR="pids"
CHAT_PID_FILE="$PID_DIR/chat-server.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend-server.pid"

# 创建PID目录
mkdir -p "$PID_DIR"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        netstat -an | grep ":$port " | grep LISTENING >/dev/null 2>&1
    else
        # 备用方法：尝试连接端口
        (echo >/dev/tcp/localhost/$port) >/dev/null 2>&1
    fi
}

# 通过端口找到进程ID
get_pid_by_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        # Windows风格的netstat输出
        netstat -ano | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1
    else
        # 备用方法
        ps aux | grep "node.*$port" | grep -v grep | awk '{print $2}' | head -1
    fi
}

# 杀死指定端口的进程
kill_process_by_port() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        local pid=$(get_pid_by_port $port)
        if [ ! -z "$pid" ]; then
            log_info "正在停止 $service_name (PID: $pid, Port: $port)..."
            if command -v taskkill >/dev/null 2>&1; then
                # Windows风格
                taskkill //PID $pid //F >/dev/null 2>&1
            else
                # Unix风格
                kill -9 $pid >/dev/null 2>&1
            fi
            
            # 等待进程停止
            sleep 2
            
            if ! check_port $port; then
                log_success "$service_name 已停止"
                return 0
            else
                log_error "无法停止 $service_name"
                return 1
            fi
        else
            log_warning "$service_name 端口被占用但无法找到进程ID"
            return 1
        fi
    else
        log_info "$service_name 未运行"
        return 0
    fi
}

# 启动聊天服务器
start_chat_server() {
    log_info "启动聊天服务器..."
    
    if check_port $CHAT_SERVER_PORT; then
        log_warning "聊天服务器已在端口 $CHAT_SERVER_PORT 运行"
        return 1
    fi
    
    if [ ! -f "$CHAT_SERVER_SCRIPT" ]; then
        log_error "找不到聊天服务器脚本: $CHAT_SERVER_SCRIPT"
        return 1
    fi
    
    # 启动聊天服务器
    nohup node "$CHAT_SERVER_SCRIPT" > logs/chat-server.log 2>&1 &
    local chat_pid=$!
    echo $chat_pid > "$CHAT_PID_FILE"
    
    # 等待服务启动
    sleep 3
    
    if check_port $CHAT_SERVER_PORT; then
        log_success "聊天服务器已启动 (PID: $chat_pid, Port: $CHAT_SERVER_PORT)"
        return 0
    else
        log_error "聊天服务器启动失败"
        rm -f "$CHAT_PID_FILE"
        return 1
    fi
}

# 启动前端服务器
start_frontend_server() {
    log_info "启动前端服务器..."
    
    if check_port $FRONTEND_SERVER_PORT; then
        log_warning "前端服务器已在端口 $FRONTEND_SERVER_PORT 运行"
        return 1
    fi
    
    # 启动前端服务器
    if command -v python >/dev/null 2>&1; then
        nohup python -m http.server $FRONTEND_SERVER_PORT > logs/frontend-server.log 2>&1 &
    elif command -v python3 >/dev/null 2>&1; then
        nohup python3 -m http.server $FRONTEND_SERVER_PORT > logs/frontend-server.log 2>&1 &
    else
        log_error "未找到Python，无法启动前端服务器"
        return 1
    fi
    
    local frontend_pid=$!
    echo $frontend_pid > "$FRONTEND_PID_FILE"
    
    # 等待服务启动
    sleep 2
    
    if check_port $FRONTEND_SERVER_PORT; then
        log_success "前端服务器已启动 (PID: $frontend_pid, Port: $FRONTEND_SERVER_PORT)"
        return 0
    else
        log_error "前端服务器启动失败"
        rm -f "$FRONTEND_PID_FILE"
        return 1
    fi
}

# 启动所有服务
start_services() {
    log_header "启动 Star Citizen 聊天服务"
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动聊天服务器
    start_chat_server
    local chat_result=$?
    
    # 启动前端服务器
    start_frontend_server
    local frontend_result=$?
    
    echo ""
    if [ $chat_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
        log_success "所有服务启动成功!"
        echo -e "${CYAN}聊天服务器: ${WHITE}http://localhost:$CHAT_SERVER_PORT${NC}"
        echo -e "${CYAN}前端页面: ${WHITE}http://localhost:$FRONTEND_SERVER_PORT${NC}"
    else
        log_error "部分服务启动失败"
        return 1
    fi
}

# 停止所有服务
stop_services() {
    log_header "停止 Star Citizen 聊天服务"
    
    local chat_result=0
    local frontend_result=0
    
    # 停止聊天服务器
    kill_process_by_port $CHAT_SERVER_PORT "聊天服务器"
    chat_result=$?
    rm -f "$CHAT_PID_FILE"
    
    # 停止前端服务器
    kill_process_by_port $FRONTEND_SERVER_PORT "前端服务器"
    frontend_result=$?
    rm -f "$FRONTEND_PID_FILE"
    
    echo ""
    if [ $chat_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
        log_success "所有服务已停止"
    else
        log_warning "部分服务停止时出现问题"
    fi
}

# 重启所有服务
restart_services() {
    log_header "重启 Star Citizen 聊天服务"
    
    stop_services
    sleep 2
    start_services
}

# 检查服务状态
check_status() {
    log_header "Star Citizen 聊天服务状态"
    
    echo -e "${WHITE}服务状态检查:${NC}"
    echo ""
    
    # 检查聊天服务器
    echo -n "聊天服务器 (端口 $CHAT_SERVER_PORT): "
    if check_port $CHAT_SERVER_PORT; then
        local pid=$(get_pid_by_port $CHAT_SERVER_PORT)
        echo -e "${GREEN}运行中${NC} (PID: $pid)"
    else
        echo -e "${RED}未运行${NC}"
    fi
    
    # 检查前端服务器
    echo -n "前端服务器 (端口 $FRONTEND_SERVER_PORT): "
    if check_port $FRONTEND_SERVER_PORT; then
        local pid=$(get_pid_by_port $FRONTEND_SERVER_PORT)
        echo -e "${GREEN}运行中${NC} (PID: $pid)"
    else
        echo -e "${RED}未运行${NC}"
    fi
    
    echo ""
    echo -e "${WHITE}访问地址:${NC}"
    echo -e "聊天服务器: ${CYAN}http://localhost:$CHAT_SERVER_PORT${NC}"
    echo -e "前端页面: ${CYAN}http://localhost:$FRONTEND_SERVER_PORT${NC}"
}

# 显示使用帮助
show_help() {
    echo -e "${WHITE}Star Citizen 聊天服务管理脚本${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
    echo -e "${WHITE}用法:${NC}"
    echo -e "  $0 ${GREEN}start${NC}     - 启动所有服务"
    echo -e "  $0 ${RED}stop${NC}      - 停止所有服务"
    echo -e "  $0 ${YELLOW}restart${NC}   - 重启所有服务"
    echo -e "  $0 ${BLUE}status${NC}    - 查看服务状态"
    echo -e "  $0 ${PURPLE}help${NC}      - 显示此帮助信息"
    echo ""
    echo -e "${WHITE}示例:${NC}"
    echo -e "  ./service-manager.sh start"
    echo -e "  ./service-manager.sh status"
    echo ""
}

# 主函数
main() {
    case "$1" in
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            check_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 检查必要条件
check_requirements() {
    # 检查Node.js
    if ! command -v node >/dev/null 2>&1; then
        log_error "未找到 Node.js，请先安装 Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm >/dev/null 2>&1; then
        log_error "未找到 npm，请先安装 npm"
        exit 1
    fi
}

# 脚本入口
if [ "$1" != "stop" ] && [ "$1" != "status" ]; then
    check_requirements
fi

main "$@" 